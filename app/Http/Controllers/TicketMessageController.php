<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Ticket_message;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketMessageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('TicketMessages/Index', [
            'ticketMessages' => Ticket_message::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('TicketMessages/Create', [
            'tickets' => Ticket::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
            'message' => ['required', 'string'],
        ]);

        Ticket_message::create($validated + ['sender_id' => $request->user()->id]);

        return redirect()->route('ticket-messages.index')->with('success', 'Ticket message created successfully.');
    }

    public function show(Ticket_message $ticket_message): Response
    {
        return Inertia::render('TicketMessages/Show', [
            'ticketMessage' => $ticket_message,
        ]);
    }

    public function edit(Ticket_message $ticket_message): Response
    {
        return Inertia::render('TicketMessages/Edit', [
            'ticketMessage' => $ticket_message,
            'tickets' => Ticket::query()->latest()->get(),
        ]);
    }

    public function update(Request $request, Ticket_message $ticket_message): RedirectResponse
    {
        $validated = $request->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
            'message' => ['required', 'string'],
        ]);

        $ticket_message->update($validated);

        return redirect()->route('ticket-messages.index')->with('success', 'Ticket message updated successfully.');
    }

    public function destroy(Ticket_message $ticket_message): RedirectResponse
    {
        $ticket_message->delete();

        return redirect()->route('ticket-messages.index')->with('success', 'Ticket message deleted successfully.');
    }
}
