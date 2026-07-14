import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ expense, buildings = [] }) {
    const config = resourceConfigs.expenses;
    const isEditing = Boolean(expense?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        title: expense?.title ?? '',
        description: expense?.description ?? '',
        amount: expense?.amount ?? '',
        date: expense?.date ? String(expense.date).slice(0, 10) : '',
        building_id: expense?.building_id ?? '',
        apartment_id: expense?.apartment_id ?? '',
    });

    const selectedBuilding = buildings.find(
        (building) => String(building.id) === String(data.building_id),
    );
    const apartments = selectedBuilding?.apartments ?? [];

    const submit = (event) => {
        event.preventDefault();

        if (isEditing) {
            put(route(`${config.route}.update`, expense.id), { preserveScroll: true });
            return;
        }

        post(route(`${config.route}.store`), { preserveScroll: true });
    };

    const changeBuilding = (event) => {
        setData('building_id', event.target.value);
        setData('apartment_id', '');
    };

    return (
        <AdminLayout
            title={isEditing ? `Modifier ${config.singular}` : `Créer ${config.singular}`}
            subtitle={isEditing ? 'Modification de la dépense.' : "Création d'une nouvelle dépense."}
            toolbar={
                <Link
                    href={route(`${config.route}.index`)}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132]"
                >
                    Retour à la liste
                </Link>
            }
        >
            <Head title={isEditing ? `Modifier ${config.singular}` : `Créer ${config.singular}`} />

            <div className="mx-auto max-w-5xl">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                    <form onSubmit={submit} className="space-y-5 p-4 sm:p-6">
                        <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
                            <div>
                                <InputLabel htmlFor="title" value="Titre" />
                                <TextInput
                                    id="title"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(event) => setData('title', event.target.value)}
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="amount" value="Montant" />
                                <TextInput
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.amount}
                                    onChange={(event) => setData('amount', event.target.value)}
                                    required
                                />
                                <InputError message={errors.amount} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="date" value="Date" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.date}
                                    onChange={(event) => setData('date', event.target.value)}
                                    required
                                />
                                <InputError message={errors.date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="building_id" value="Immeuble" />
                                <select
                                    id="building_id"
                                    value={data.building_id}
                                    onChange={changeBuilding}
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    required
                                >
                                    <option value="">Sélectionner un immeuble</option>
                                    {buildings.map((building) => (
                                        <option key={building.id} value={building.id}>
                                            {building.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.building_id} className="mt-2" />
                            </div>

                            {data.building_id && (
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="apartment_id" value="Lots concernés" />
                                    <select
                                        id="apartment_id"
                                        value={data.apartment_id}
                                        onChange={(event) => setData('apartment_id', event.target.value)}
                                        className="mt-1 block w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    >
                                        <option value="">Tous les lots de l'immeuble</option>
                                        {apartments.map((apartment) => (
                                            <option key={apartment.id} value={apartment.id}>
                                                Lot {apartment.number}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.apartment_id} className="mt-2" />
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600"
                                    required
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <PrimaryButton disabled={processing}>
                                {isEditing ? `Mettre à jour ${config.singular}` : `Créer ${config.singular}`}
                            </PrimaryButton>
                            <Link
                                href={route(`${config.route}.index`)}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition duration-150 ease-in-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:text-xs"
                            >
                                Annuler
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}
