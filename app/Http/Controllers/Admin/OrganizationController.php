<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(): Response
    {
        $organizations = Organization::query()
            ->withCount(['users', 'buildings'])
            ->latest()
            ->get()
            ->map(fn (Organization $organization) => $this->serializeOrganization($organization));

        $activeOrganizations = $organizations
            ->where('subscription_status', 'active');

        return Inertia::render('Admin/Organizations/Index', [
            'organizations' => $organizations->values(),
            'summary' => [
                'total' => $organizations->count(),
                'active' => $activeOrganizations->count(),
                'pending' => $organizations->where('subscription_status', 'pending')->count(),
                'monthlyRevenue' => round($activeOrganizations->sum('monthly_revenue'), 2),
            ],
        ]);
    }

    public function edit(Organization $organization): Response
    {
        return Inertia::render('Admin/Organizations/Edit', [
            'organization' => $this->serializeOrganization(
                $organization->loadCount(['users', 'buildings'])
            ),
            'plans' => $this->plans(),
            'statuses' => $this->statuses(),
            'billingCycles' => $this->billingCycles(),
        ]);
    }

    public function update(Request $request, Organization $organization): RedirectResponse
    {
        $endDateRules = ['nullable', 'date'];

        if ($request->filled('subscription_started_at')) {
            $endDateRules[] = 'after_or_equal:subscription_started_at';
        }

        $validated = $request->validate([
            'plan' => ['nullable', Rule::in(array_keys($this->plans()))],
            'subscription_status' => ['required', Rule::in(array_keys($this->statuses()))],
            'subscription_started_at' => ['nullable', 'date'],
            'subscription_ends_at' => $endDateRules,
            'billing_cycle' => ['nullable', Rule::in(array_keys($this->billingCycles()))],
            'subscription_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
        ]);

        $organization->update($validated);

        return redirect()
            ->route('admin.organizations.index')
            ->with('success', "Abonnement de l'organisation mis à jour.");
    }

    private function serializeOrganization(Organization $organization): array
    {
        $price = (float) ($organization->subscription_price ?? 0);

        return [
            'id' => $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
            'email' => $organization->email,
            'phone' => $organization->phone,
            'plan' => $organization->plan,
            'subscription_status' => $organization->subscription_status,
            'subscription_started_at' => optional($organization->subscription_started_at)->format('Y-m-d'),
            'subscription_ends_at' => optional($organization->subscription_ends_at)->format('Y-m-d'),
            'billing_cycle' => $organization->billing_cycle,
            'subscription_price' => $organization->subscription_price !== null ? $price : null,
            'monthly_revenue' => $organization->subscription_status === 'active'
                ? $this->monthlyRevenue($price, $organization->billing_cycle)
                : 0,
            'users_count' => $organization->users_count ?? null,
            'buildings_count' => $organization->buildings_count ?? null,
            'created_at' => optional($organization->created_at)->format('d/m/Y'),
        ];
    }

    private function monthlyRevenue(float $price, ?string $billingCycle): float
    {
        return $billingCycle === 'annual'
            ? round($price / 12, 2)
            : $price;
    }

    private function plans(): array
    {
        return [
            'basic' => 'Basic',
            'standard' => 'Standard',
            'premium' => 'Premium',
        ];
    }

    private function statuses(): array
    {
        return [
            'pending' => 'En attente',
            'active' => 'Actif',
            'expired' => 'Expire',
            'suspended' => 'Suspendu',
        ];
    }

    private function billingCycles(): array
    {
        return [
            'monthly' => 'Mensuel',
            'annual' => 'Annuel',
        ];
    }
}
