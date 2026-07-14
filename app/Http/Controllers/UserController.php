<?php

namespace App\Http\Controllers;

use App\Mail\UserInvitationMail;
use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    private const USER_ROLES = ['Syndic', 'Coproprietaire', 'Locataire'];

    private const INVITABLE_ROLES = ['Coproprietaire', 'Locataire'];

    public function index(Request $request): Response
    {
        $query = User::query()
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->user()->role === 'Syndic') {
            $query->whereIn('role', ['Locataire', 'Coproprietaire']);
        }

        return Inertia::render('Users/Index', [
            'users' => $query
                ->with(['latestInvitation', 'apartments.floor.building'])
                ->latest()
                ->paginate(10)
                ->through(fn (User $user) => $this->serializeUser($user)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'invitableRoles' => self::INVITABLE_ROLES,
            'availableApartments' => $this->availableApartmentOptions(),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(self::INVITABLE_ROLES)],
            'apartment_id' => [
                'required',
                Rule::exists('apartments', 'id')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $request->user()->organization_id)
                        ->whereNull('user_id')),
            ],
        ]);

        [$user, $invitation, $token] = DB::transaction(function () use ($request, $validated): array {
            $apartment = Apartment::query()
                ->with('floor.building')
                ->whereKey($validated['apartment_id'])
                ->where('organization_id', $request->user()->organization_id)
                ->whereNull('user_id')
                ->lockForUpdate()
                ->first();

            if (! $apartment) {
                throw ValidationException::withMessages([
                    'apartment_id' => 'Ce lot est déjà occupé. Choisissez un lot libre.',
                ]);
            }

            $user = User::create([
                'organization_id' => $request->user()->organization_id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? null,
                'role' => $validated['role'],
                'password' => Hash::make(Str::random(48)),
            ]);

            $apartment->forceFill(['user_id' => $user->id])->save();

            Audit_log::create([
                'action' => 'Création de compte utilisateur',
                'details' => 'Un compte pour '.$user->name.' a été créé avec le rôle '.$user->role.' et associé au '.$this->formatApartmentLabel($apartment).'.',
                'performed_by' => auth()->id(),
            ]);

            [$invitation, $token] = $this->createInvitation($user, $request->user()?->id);

            return [$user, $invitation, $token];
        });

        try {
            $this->sendInvitationEmail($user, $invitation, $token);
        } catch (Throwable $exception) {
            report($exception);

            return redirect()
                ->route('users.show', $user)
                ->with('error', "Compte créé, mais l'e-mail d'invitation n'a pas pu être envoyé.");
        }

        return redirect()->route('users.index')->with('success', 'Compte créé et invitation envoyée.');
    }

    public function show(User $user): Response
    {
        $this->ensureSameOrganization($user);

        $user->load(['latestInvitation', 'apartments.floor.building']);

        return Inertia::render('Users/Show', [
            'user' => $this->serializeUser($user),
        ]);
    }

    public function edit(User $user): Response
    {
        $this->ensureSameOrganization($user);

        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->ensureSameOrganization($user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(self::USER_ROLES)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => $validated['role'],
        ]);

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        Audit_log::create([
            'action' => 'Mise à jour de compte utilisateur',
            'details' => 'Le compte de '.$user->name.' a été mis à jour.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('users.index')->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function resendInvitation(Request $request, User $user): RedirectResponse
    {
        $this->ensureSameOrganization($user);

        if (! in_array($user->role, self::INVITABLE_ROLES, true)) {
            return back()->with('error', 'Seuls les copropriétaires et locataires peuvent recevoir une invitation.');
        }

        if ($user->email_verified_at !== null) {
            return back()->with('error', 'Ce compte est déjà actif.');
        }

        [$invitation, $token] = $this->createInvitation($user, $request->user()?->id);

        try {
            $this->sendInvitationEmail($user, $invitation, $token);
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', "L'e-mail d'invitation n'a pas pu être envoyé.");
        }

        return back()->with('success', 'Invitation renvoyée.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->ensureSameOrganization($user);

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->delete();

        Audit_log::create([
            'action' => 'Suppression de compte utilisateur',
            'details' => 'Le compte de '.$user->name.' a été supprimé.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('users.index')->with('success', 'Utilisateur supprimé avec succès.');
    }

    private function createInvitation(User $user, ?int $creatorId): array
    {
        $user->invitations()
            ->whereNull('accepted_at')
            ->update(['expires_at' => now()]);

        $token = Str::random(64);

        $invitation = UserInvitation::create([
            'user_id' => $user->id,
            'created_by' => $creatorId,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHours(72),
        ]);

        return [$invitation, $token];
    }

    private function sendInvitationEmail(User $user, UserInvitation $invitation, string $token): void
    {
        Mail::to($user->email)->send(new UserInvitationMail(
            user: $user,
            acceptUrl: route('invitations.accept', $token),
            expiresAt: $invitation->expires_at->format('d/m/Y H:i'),
        ));

        $invitation->forceFill(['sent_at' => now()])->save();
    }

    private function serializeUser(User $user): array
    {
        $invitation = $user->latestInvitation;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'profile_photo_url' => $user->profile_photo_url,
            'role' => $user->role,
            'apartment_label' => $this->userApartmentLabel($user),
            'apartments_count' => $user->apartments->count(),
            'email_verified_at' => $user->email_verified_at,
            'invitation_status' => $this->invitationStatus($user, $invitation),
            'invitation_expires_at' => $invitation?->expires_at?->format('d/m/Y H:i'),
            'can_resend_invitation' => in_array($user->role, self::INVITABLE_ROLES, true)
                && $user->email_verified_at === null,
        ];
    }

    private function ensureSameOrganization(User $user): void
    {
        abort_unless(
            $user->organization_id === request()->user()?->organization_id,
            403,
            'Unauthorized'
        );
    }

    private function invitationStatus(User $user, ?UserInvitation $invitation): string
    {
        if ($user->email_verified_at !== null) {
            return 'Actif';
        }

        if ($invitation === null) {
            return 'Non invité';
        }

        if ($invitation->accepted_at !== null) {
            return 'Accepté';
        }

        if ($invitation->expires_at->isPast()) {
            return 'Expirée';
        }

        return 'Invitation envoyée';
    }

    private function availableApartmentOptions(): array
    {
        return Apartment::query()
            ->with('floor.building')
            ->where('organization_id', request()->user()?->organization_id)
            ->whereNull('user_id')
            ->orderBy('number')
            ->get()
            ->map(fn (Apartment $apartment) => [
                'id' => $apartment->id,
                'number' => $apartment->number,
                'area' => $apartment->area !== null ? (float) $apartment->area : null,
                'floor_number' => $apartment->floor?->number,
                'building_name' => $apartment->floor?->building?->name,
                'building_address' => $apartment->floor?->building?->address,
                'label' => $this->formatApartmentLabel($apartment),
            ])
            ->sortBy('label', SORT_NATURAL)
            ->values()
            ->all();
    }

    private function userApartmentLabel(User $user): string
    {
        $labels = $user->apartments
            ->map(fn (Apartment $apartment) => $this->formatApartmentLabel($apartment))
            ->values()
            ->all();

        return count($labels) > 0 ? implode(', ', $labels) : 'Aucun lot';
    }

    private function formatApartmentLabel(Apartment $apartment): string
    {
        $parts = ['Lot '.$apartment->number];

        if ($apartment->floor?->number) {
            $parts[] = 'Étage '.$apartment->floor->number;
        }

        if ($apartment->floor?->building?->name) {
            $parts[] = $apartment->floor->building->name;
        }

        return implode(' - ', $parts);
    }
}
