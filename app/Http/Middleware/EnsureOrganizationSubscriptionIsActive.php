<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationSubscriptionIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect('/login');
        }

        if ($user->role === 'SuperAdmin') {
            return $next($request);
        }

        $organization = $user->organization;

        abort_unless($organization, 403, 'Aucune organisation rattachee a ce compte.');

        if (in_array($organization->subscription_status, ['suspended', 'expired'], true)) {
            abort(403, 'Votre organisation est suspendue. Veuillez contacter la plateforme SyndiCare.');
        }

        return $next($request);
    }
}
