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

        $query = Ticket::query()
            ->with([
                'apartment.floor.building',
                'assignedTo:id,name,role',
                'createdBy:id,name,email,role',
            ])
            ->latest();

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
            'tickets' => $query
                ->paginate(10)
                ->through(fn (Ticket $ticket) => $this->serializeTicket($ticket)),
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
        $isSyndic = $request->user()?->role === 'Syndic';

        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
        ];

        if ($isSyndic) {
            $rules['assigned_to'] = ['nullable', $this->tenantExists('users')];
            $rules['status'] = ['required', Rule::in(['open', 'in_progress', 'closed'])];
        }

        $validated = $request->validate($rules);

        if ($request->user()?->role !== 'Syndic') {
            $ownsApartment = empty($validated['apartment_id'])
                || Apartment::query()
                    ->whereKey($validated['apartment_id'])
                    ->where('user_id', $request->user()->id)
                    ->exists();

            abort_unless($ownsApartment, 403, 'Unauthorized');

            $validated['apartment_id'] = $validated['apartment_id']
                ?? $this->defaultApartmentIdFor($request->user());
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
                'Le ticket "%s" a été créé par %s.',
                $ticket->title,
                $request->user()->name
            ),
            'warning'
        );

        return redirect()->route('tickets.index')->with('success', 'Ticket créé avec succès.');
    }

    public function show(Ticket $ticket): Response
    {
        $this->authorize('view', $ticket);

        return Inertia::render('Tickets/Show', [
            'ticket' => $this->serializeTicket($ticket->load([
                'apartment.floor.building',
                'assignedTo:id,name,role',
                'createdBy:id,name,role',
                'ticketMessages' => fn ($query) => $query
                    ->with('sender:id,name,role')
                    ->oldest(),
            ]), includeMessages: true),
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
        $isSyndic = $request->user()?->role === 'Syndic';

        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
        ];

        if ($isSyndic) {
            $rules['assigned_to'] = ['nullable', $this->tenantExists('users')];
            $rules['status'] = ['required', Rule::in(['open', 'in_progress', 'closed'])];
        }

        $validated = $request->validate($rules);

        if ($request->user()?->role !== 'Syndic') {
            $ownsApartment = empty($validated['apartment_id'])
                || Apartment::query()
                    ->whereKey($validated['apartment_id'])
                    ->where('user_id', $request->user()->id)
                    ->exists();

            abort_unless($ownsApartment, 403, 'Unauthorized');

            $validated['apartment_id'] = $validated['apartment_id']
                ?? $ticket->apartment_id
                ?? $this->defaultApartmentIdFor($request->user());
            $validated['assigned_to'] = $ticket->assigned_to;
            $validated['status'] = $ticket->status;
        }

        $ticket->update($validated);

        Audit_log::create([
            'action' => 'Mise à jour de ticket',
            'details' => 'Le ticket "'.$ticket->title.'" a été mis à jour par '.$request->user()->name.'.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('tickets.index')->with('success', 'Ticket mis à jour avec succès.');
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

        return redirect()->route('tickets.index')->with('success', 'Ticket supprimé avec succès.');
    }

    private function defaultApartmentIdFor(User $user): ?int
    {
        return Apartment::query()
            ->where('user_id', $user->id)
            ->orderBy('number')
            ->value('id');
    }

    private function serializeTicket(Ticket $ticket, bool $includeMessages = false): array
    {
        $apartment = $ticket->apartment;
        $resident = $ticket->createdBy;

        $payload = [
            'id' => $ticket->id,
            'title' => $ticket->title,
            'description' => $ticket->description,
            'status' => $ticket->status,
            'apartment_id' => $ticket->apartment_id,
            'assigned_to' => $ticket->assigned_to,
            'assingned_by' => $ticket->assingned_by,
            'resident_label' => $resident?->name ?? '-',
            'resident_email' => $resident?->email,
            'apartment_label' => $apartment
                ? 'Lot '.$apartment->number
                : 'Aucun lot',
            'building_label' => $apartment?->floor?->building?->name,
            'created_by' => $resident ? [
                'id' => $resident->id,
                'name' => $resident->name,
                'role' => $resident->role,
            ] : null,
            'assigned_user' => $ticket->assignedTo ? [
                'id' => $ticket->assignedTo->id,
                'name' => $ticket->assignedTo->name,
                'role' => $ticket->assignedTo->role,
            ] : null,
        ];

        if ($includeMessages) {
            $payload['ticket_messages'] = $ticket->ticketMessages
                ->map(fn ($message) => [
                    'id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'message' => $message->message,
                    'created_at' => optional($message->created_at)->format('d/m/Y H:i'),
                    'sender' => $message->sender ? [
                        'id' => $message->sender->id,
                        'name' => $message->sender->name,
                        'role' => $message->sender->role,
                    ] : null,
                ])
                ->values()
                ->all();
        }

        return $payload;
    }
}
