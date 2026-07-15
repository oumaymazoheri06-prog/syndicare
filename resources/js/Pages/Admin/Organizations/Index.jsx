import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

const planLabels = {
    basic: 'Basic',
    standard: 'Standard',
    premium: 'Premium',
};

const statusLabels = {
    pending: 'En attente',
    active: 'Actif',
    expired: 'Expire',
    suspended: 'Suspendu',
};

const cycleLabels = {
    monthly: 'Mensuel',
    annual: 'Annuel',
};

const statusClasses = {
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    expired: 'border-slate-200 bg-slate-50 text-slate-700',
    suspended: 'border-rose-200 bg-rose-50 text-rose-800',
};

function formatMoney(value) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-lg border border-white/80 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {label}
            </p>
            <p className="mt-2 text-2xl font-black text-[#0F5132]">
                {value}
            </p>
        </div>
    );
}

export default function Index({ organizations = [], summary = {} }) {
    return (
        <AdminLayout
            title="Organisations"
            subtitle="Vue plateforme des clients, abonnements et revenus mensuels."
        >
            <Head title="Organisations" />

            <div className="space-y-5">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Organisations" value={summary.total ?? 0} />
                    <StatCard label="Actives" value={summary.active ?? 0} />
                    <StatCard label="En attente" value={summary.pending ?? 0} />
                    <StatCard
                        label="Revenu mensuel"
                        value={formatMoney(summary.monthlyRevenue)}
                    />
                </section>

                <section className="overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-sm">
                    <div className="overflow-hidden">
                        <table className="w-full table-fixed divide-y divide-slate-200 text-xs">
                            <thead className="bg-slate-50 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-3 py-2.5">Organisation</th>
                                    <th className="px-3 py-2.5">Plan</th>
                                    <th className="px-3 py-2.5">Statut</th>
                                    <th className="hidden px-3 py-2.5 md:table-cell">Prix</th>
                                    <th className="hidden px-3 py-2.5 xl:table-cell">Fin</th>
                                    <th className="hidden px-3 py-2.5 xl:table-cell">Users</th>
                                    <th className="hidden px-3 py-2.5 xl:table-cell">Immeubles</th>
                                    <th className="w-20 px-3 py-2.5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {organizations.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-4 py-10 text-center text-slate-500"
                                        >
                                            Aucune organisation trouvée.
                                        </td>
                                    </tr>
                                )}

                                {organizations.map((organization) => (
                                    <tr
                                        key={organization.id}
                                        className="bg-white transition hover:bg-emerald-50/40"
                                    >
                                        <td className="min-w-0 px-3 py-2.5">
                                            <p className="truncate font-bold text-slate-950">
                                                {organization.name}
                                            </p>
                                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                                {organization.email || organization.slug}
                                            </p>
                                        </td>
                                        <td className="px-3 py-2.5 text-slate-700">
                                            <span className="block truncate">
                                                {planLabels[organization.plan] || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span
                                                className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold ${
                                                    statusClasses[
                                                        organization.subscription_status
                                                    ] ||
                                                    'border-slate-200 bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                {statusLabels[
                                                    organization.subscription_status
                                                ] || '-'}
                                            </span>
                                        </td>
                                        <td className="hidden px-3 py-2.5 text-slate-700 md:table-cell">
                                            <p className="font-semibold">
                                                {organization.subscription_price !== null
                                                    ? formatMoney(
                                                          organization.subscription_price,
                                                      )
                                                    : '-'}
                                            </p>
                                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                                {cycleLabels[
                                                    organization.billing_cycle
                                                ] || ''}
                                            </p>
                                        </td>
                                        <td className="hidden px-3 py-2.5 text-slate-700 xl:table-cell">
                                            {organization.subscription_ends_at || '-'}
                                        </td>
                                        <td className="hidden px-3 py-2.5 text-slate-700 xl:table-cell">
                                            {organization.users_count ?? 0}
                                        </td>
                                        <td className="hidden px-3 py-2.5 text-slate-700 xl:table-cell">
                                            {organization.buildings_count ?? 0}
                                        </td>
                                        <td className="w-20 px-3 py-2.5 text-right">
                                            <Link
                                                href={route(
                                                    'admin.organizations.edit',
                                                    organization.id,
                                                )}
                                                className="inline-flex rounded-lg bg-[#0F5132] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#146C43]"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
