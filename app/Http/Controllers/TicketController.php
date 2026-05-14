<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
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
    public function index(): Response
    {
        return Inertia::render('Tickets/Index', [
            'tickets' => Ticket::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Tickets/Create', [
            'users' => User::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'apartment_id' => ['nullable', 'exists:apartments,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
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
        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function edit(Ticket $ticket): Response
    {
        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket,
            'users' => User::query()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'apartment_id' => ['nullable', 'exists:apartments,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'status' => ['required', Rule::in(['open', 'in_progress', 'closed'])],
        ]);

        $ticket->update($validated);

        return redirect()->route('tickets.index')->with('success', 'Ticket updated successfully.');
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        $ticket->delete();

        return redirect()->route('tickets.index')->with('success', 'Ticket deleted successfully.');
    }
}
