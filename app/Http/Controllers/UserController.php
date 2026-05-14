<?php

namespace App\Http\Controllers;

use App\Mail\UserInvitationMail;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    private const USER_ROLES = ['Syndic', 'Coproprietaire', 'Locataire'];

    private const INVITABLE_ROLES = ['Coproprietaire', 'Locataire'];

    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->with('latestInvitation')
                ->latest()
                ->paginate(10)
                ->through(fn (User $user) => $this->serializeUser($user)),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'invitableRoles' => self::INVITABLE_ROLES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(self::INVITABLE_ROLES)],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => $validated['role'],
            'password' => Hash::make(Str::random(48)),
        ]);

        [$invitation, $token] = $this->createInvitation($user, $request->user()?->id);

        try {
            $this->sendInvitationEmail($user, $invitation, $token);
        } catch (Throwable $exception) {
            report($exception);

            return redirect()
                ->route('users.show', $user)
                ->with('error', 'Compte cree, mais l email d invitation n a pas pu etre envoye.');
        }

        return redirect()->route('users.index')->with('success', 'Compte cree et invitation envoyee.');
    }

    public function show(User $user): Response
    {
        $user->load('latestInvitation');

        return Inertia::render('Users/Show', [
            'user' => $this->serializeUser($user),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
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

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function resendInvitation(Request $request, User $user): RedirectResponse
    {
        if (! in_array($user->role, self::INVITABLE_ROLES, true)) {
            return back()->with('error', 'Seuls les coproprietaires et locataires peuvent recevoir une invitation.');
        }

        if ($user->email_verified_at !== null) {
            return back()->with('error', 'Ce compte est deja actif.');
        }

        [$invitation, $token] = $this->createInvitation($user, $request->user()?->id);

        try {
            $this->sendInvitationEmail($user, $invitation, $token);
        } catch (Throwable $exception) {
            report($exception);

            return back()->with('error', 'L email d invitation n a pas pu etre envoye.');
        }

        return back()->with('success', 'Invitation renvoyee.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
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
            'role' => $user->role,
            'email_verified_at' => $user->email_verified_at,
            'invitation_status' => $this->invitationStatus($user, $invitation),
            'invitation_expires_at' => $invitation?->expires_at?->format('d/m/Y H:i'),
            'can_resend_invitation' => in_array($user->role, self::INVITABLE_ROLES, true)
                && $user->email_verified_at === null,
        ];
    }

    private function invitationStatus(User $user, ?UserInvitation $invitation): string
    {
        if ($user->email_verified_at !== null) {
            return 'Actif';
        }

        if ($invitation === null) {
            return 'Non invite';
        }

        if ($invitation->accepted_at !== null) {
            return 'Accepte';
        }

        if ($invitation->expires_at->isPast()) {
            return 'Expiree';
        }

        return 'Invitation envoyee';
    }
}
