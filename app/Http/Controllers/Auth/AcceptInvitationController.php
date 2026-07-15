<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserInvitation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AcceptInvitationController extends Controller
{
    public function show(string $token): Response
    {
        $invitation = $this->findInvitation($token);
        $canAccept = $invitation?->isPending() ?? false;

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'email' => $invitation?->user?->email,
            'name' => $invitation?->user?->name,
            'expiresAt' => $invitation?->expires_at?->format('d/m/Y H:i'),
            'canAccept' => $canAccept,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $invitation = $this->findInvitation($token);

        if (! $invitation?->isPending()) {
            throw ValidationException::withMessages([
                'password' => 'Cette invitation est invalide ou expirée.',
            ]);
        }

        DB::transaction(function () use ($invitation, $request): void {
            $invitation->user->forceFill([
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
                'remember_token' => Str::random(60),
            ])->save();

            $invitation->forceFill([
                'accepted_at' => now(),
            ])->save();
        });

        event(new Registered($invitation->user));

        Auth::login($invitation->user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function findInvitation(string $token): ?UserInvitation
    {
        return UserInvitation::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $token))
            ->first();
    }
}
