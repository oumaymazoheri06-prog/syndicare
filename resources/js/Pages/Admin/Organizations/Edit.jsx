import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

function SelectInput({ id, value, onChange, children }) {
    return (
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
        >
            {children}
        </select>
    );
}

export default function Edit({
    organization,
    plans = {},
    statuses = {},
    billingCycles = {},
}) {
    const { data, setData, put, processing, errors } = useForm({
        plan: organization.plan || '',
        subscription_status: organization.subscription_status || 'pending',
        subscription_started_at: organization.subscription_started_at || '',
        subscription_ends_at: organization.subscription_ends_at || '',
        billing_cycle: organization.billing_cycle || '',
        subscription_price: organization.subscription_price ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.organizations.update', organization.id));
    };

    return (
        <AdminLayout
            title="Modifier l organisation"
            subtitle={organization.name}
            toolbar={
                <Link
                    href={route('admin.organizations.index')}
                    className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Retour
                </Link>
            }
        >
            <Head title={`Organisation - ${organization.name}`} />

            <div className="grid gap-5 xl:grid-cols-[0.72fr_0.28fr]">
                <form
                    onSubmit={submit}
                    className="rounded-lg border border-white/80 bg-white/90 p-5 shadow-sm"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="plan" value="Plan" />
                            <SelectInput
                                id="plan"
                                value={data.plan}
                                onChange={(event) =>
                                    setData('plan', event.target.value)
                                }
                            >
                                <option value="">Aucun plan</option>
                                {Object.entries(plans).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.plan} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="subscription_status"
                                value="Statut"
                            />
                            <SelectInput
                                id="subscription_status"
                                value={data.subscription_status}
                                onChange={(event) =>
                                    setData(
                                        'subscription_status',
                                        event.target.value,
                                    )
                                }
                            >
                                {Object.entries(statuses).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError
                                message={errors.subscription_status}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="billing_cycle"
                                value="Facturation"
                            />
                            <SelectInput
                                id="billing_cycle"
                                value={data.billing_cycle}
                                onChange={(event) =>
                                    setData('billing_cycle', event.target.value)
                                }
                            >
                                <option value="">Non definie</option>
                                {Object.entries(billingCycles).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </SelectInput>
                            <InputError
                                message={errors.billing_cycle}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="subscription_price"
                                value="Prix"
                            />
                            <TextInput
                                id="subscription_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.subscription_price}
                                onChange={(event) =>
                                    setData(
                                        'subscription_price',
                                        event.target.value,
                                    )
                                }
                                className="mt-1 block w-full"
                            />
                            <InputError
                                message={errors.subscription_price}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="subscription_started_at"
                                value="Debut abonnement"
                            />
                            <TextInput
                                id="subscription_started_at"
                                type="date"
                                value={data.subscription_started_at}
                                onChange={(event) =>
                                    setData(
                                        'subscription_started_at',
                                        event.target.value,
                                    )
                                }
                                className="mt-1 block w-full"
                            />
                            <InputError
                                message={errors.subscription_started_at}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="subscription_ends_at"
                                value="Fin abonnement"
                            />
                            <TextInput
                                id="subscription_ends_at"
                                type="date"
                                value={data.subscription_ends_at}
                                onChange={(event) =>
                                    setData(
                                        'subscription_ends_at',
                                        event.target.value,
                                    )
                                }
                                className="mt-1 block w-full"
                            />
                            <InputError
                                message={errors.subscription_ends_at}
                                className="mt-2"
                            />
                        </div>

                    </div>

                    <div className="mt-6 flex justify-end">
                        <PrimaryButton disabled={processing}>
                            Enregistrer
                        </PrimaryButton>
                    </div>
                </form>

                <aside className="rounded-lg border border-white/80 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Organisation
                    </p>
                    <div className="mt-4 space-y-4 text-sm">
                        <div>
                            <p className="text-slate-500">Nom</p>
                            <p className="font-bold text-slate-950">
                                {organization.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Email</p>
                            <p className="font-bold text-slate-950">
                                {organization.email || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Utilisateurs</p>
                            <p className="font-bold text-slate-950">
                                {organization.users_count ?? 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Immeubles</p>
                            <p className="font-bold text-slate-950">
                                {organization.buildings_count ?? 0}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </AdminLayout>
    );
}
