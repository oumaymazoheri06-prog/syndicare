<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Ticket;
use App\Models\Ticket_message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Ticket_message::class);

        $query = Ticket_message::query()->with('ticket.apartment')->latest();

        if ($request->user()->role !== 'Syndic') {
            $query->where(function ($q) use ($request) {
                $q->where('sender_id', $request->user()->id)
                    ->orWhereHas('ticket', function ($ticketQuery) use ($request) {
                        $ticketQuery->where('assingned_by', $request->user()->id)
                            ->orWhere('assigned_to', $request->user()->id)
                            ->orWhereHas('apartment', function ($apartmentQuery) use ($request) {
                                $apartmentQuery->where('user_id', $request->user()->id);
                            });
                    });
            });
        }

        return Inertia::render('TicketMessages/Index', [
            'ticketMessages' => $query->paginate(10),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Ticket_message::class);

        $tickets = Ticket::query()->latest();

        if ($request->user()->role !== 'Syndic') {
            $tickets->where(function ($q) use ($request) {
                $q->where('assingned_by', $request->user()->id)
                    ->orWhere('assigned_to', $request->user()->id)
                    ->orWhereHas('apartment', function ($apartmentQuery) use ($request) {
                        $apartmentQuery->where('user_id', $request->user()->id);
                    });
            });
        }
       

        return Inertia::render('TicketMessages/Create', [
            'tickets' => $tickets->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Ticket_message::class);

        $validated = $request->validate([
            'ticket_id' => ['required', $this->tenantExists('tickets')],
            'message' => ['required', 'string'],
        ]);

        $ticket = Ticket::query()->with('apartment')->findOrFail($validated['ticket_id']);
        $this->authorize('view', $ticket);

        Ticket_message::create($validated + ['sender_id' => $request->user()->id]);

        return redirect()->route('tickets.show', $ticket)->with('success', 'Message ajoute au suivi.');
    }

    public function show(Ticket_message $ticket_message): Response
    {
        $this->authorize('view', $ticket_message);

        return Inertia::render('TicketMessages/Show', [
            'ticketMessage' => $ticket_message,
        ]);
    }

    public function edit(Ticket_message $ticket_message): Response
    {
        $this->authorize('update', $ticket_message);

        return Inertia::render('TicketMessages/Edit', [
            'ticketMessage' => $ticket_message,
            'tickets' => Ticket::query()->latest()->get(),
        ]);
    }

    public function update(Request $request, Ticket_message $ticket_message): RedirectResponse
    {
        $this->authorize('update', $ticket_message);

        $validated = $request->validate([
            'ticket_id' => ['required', $this->tenantExists('tickets')],
            'message' => ['required', 'string'],
        ]);

        $ticket = Ticket::query()->with('apartment')->findOrFail($validated['ticket_id']);
        $this->authorize('view', $ticket);

        $ticket_message->update($validated);

        return redirect()->route('ticket-messages.index')->with('success', 'Ticket message updated successfully.');
    }

    public function destroy(Ticket_message $ticket_message): RedirectResponse
    {
        $this->authorize('delete', $ticket_message);

        $ticket_message->delete();

        return redirect()->route('ticket-messages.index')->with('success', 'Ticket message deleted successfully.');
    }
}
