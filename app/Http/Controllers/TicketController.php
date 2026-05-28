<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Ticket;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Ticket::class);

        $query = Ticket::query()->latest();

        if ($request->user()->role !== 'Syndic') {
            $query->where(function ($q) use ($request) {
                $q->where('assingned_by', $request->user()->id)
                    ->orWhere('assigned_to', $request->user()->id)
                    ->orWhereHas('apartment', function ($apartmentQuery) use ($request) {
                        $apartmentQuery->where('user_id', $request->user()->id);
                    });
            });
        }

        return Inertia::render('Tickets/Index', [
            'tickets' => $query->paginate(10),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Ticket::class);
        
        return Inertia::render('Tickets/Create', [
            'users' => $request->user()->role === 'Syndic'
                ? User::query()
                    ->where('organization_id', $request->user()->organization_id)
                    ->orderBy('name')
                    ->get()
                : [],
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Ticket::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
            'assigned_to' => ['nullable', $this->tenantExists('users')],
            'status' => ['required', Rule::in(['open', 'in_progress', 'closed'])],
        ]);

                

        if ($request->user()?->role !== 'Syndic') {
            $ownsApartment = empty($validated['apartment_id'])
                || Apartment::query()
                    ->whereKey($validated['apartment_id'])
                    ->where('user_id', $request->user()->id)
                    ->exists();

            abort_unless($ownsApartment, 403, 'Unauthorized');

            $validated['assigned_to'] = null;
            $validated['status'] = 'open';
        }

        $ticket = Ticket::create($validated + ['assingned_by' => $request->user()->id]);
Audit_log::create([
    'action' => 'Création de ticket',
    'details' => 'Le ticket "'.$ticket->title.'" a été créé par '.$request->user()->name.'.',
    'performed_by' => auth()->id(),
]);
        $notifications->createForRole(
            'Syndic',
            'Nouveau ticket',
            sprintf(
                'Le ticket "%s" a ete cree par %s.',
                $ticket->title,
                $request->user()->name
            ),
            'warning'
        );

        return redirect()->route('tickets.index')->with('success', 'Ticket created successfully.');
    }

    public function show(Ticket $ticket): Response
    {
        $this->authorize('view', $ticket);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket->load([
                'apartment',
                'assignedTo:id,name,role',
                'createdBy:id,name,role',
                'ticketMessages' => fn ($query) => $query
                    ->with('sender:id,name,role')
                    ->oldest(),
            ]),
        ]);
    }

    public function edit(Ticket $ticket): Response
    {
        $this->authorize('update', $ticket);

        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket,
            'users' => User::query()
                ->where('organization_id', request()->user()?->organization_id)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $this->authorize('update', $ticket);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
            'assigned_to' => ['nullable', $this->tenantExists('users')],
            'status' => ['required', Rule::in(['open', 'in_progress', 'closed'])],
        ]);

        if ($request->user()?->role !== 'Syndic') {
            $ownsApartment = empty($validated['apartment_id'])
                || Apartment::query()
                    ->whereKey($validated['apartment_id'])
                    ->where('user_id', $request->user()->id)
                    ->exists();

            abort_unless($ownsApartment, 403, 'Unauthorized');

            $validated['assigned_to'] = $ticket->assigned_to;
            $validated['status'] = $ticket->status;
        }

        $ticket->update($validated);

        Audit_log::create([
            'action' => 'Mise à jour de ticket',
            'details' => 'Le ticket "'.$ticket->title.'" a été mis à jour par '.$request->user()->name.'.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('tickets.index')->with('success', 'Ticket updated successfully.');
    }

    public function destroy(Ticket $ticket, Request $request): RedirectResponse
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        Audit_log::create([
            'action' => 'Suppression de ticket',
            'details' => 'Le ticket "'.$ticket->title.'" a été supprimé par '.$request->user()->name.'.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('tickets.index')->with('success', 'Ticket deleted successfully.');
    }
}
