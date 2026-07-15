import { CrudFormPage } from '@/Components/CrudScaffold';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

function roleLabel(role) {
    return role === 'Coproprietaire' ? 'Copropriétaire' : role;
}

function formatArea(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return `${new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 2,
    }).format(Number(value))} m²`;
}

function InviteField({ id, label, required = false, error, helper, children }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
                {label}
                {required && <span className="text-rose-600"> *</span>}
            </label>

            {children}

            {helper && !error && (
                <p className="text-xs leading-5 text-slate-500">{helper}</p>
            )}

            <InputError message={error} />
        </div>
    );
}

function ApartmentPreview({ apartment, hasAvailableApartments }) {
    if (!hasAvailableApartments) {
        return (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                Aucun lot libre disponible pour le moment.
            </div>
        );
    }

    if (!apartment) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Sélectionnez un lot pour afficher son immeuble, son étage et sa surface.
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        Lot libre
                    </p>
                    <h3 className="mt-1 truncate text-xl font-bold text-slate-950">
                        Lot {apartment.number}
                    </h3>
                </div>
                <span className="rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Disponible
                </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Immeuble
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                        {apartment.building_name ?? '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Étage
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                        {apartment.floor_number ?? '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Surface
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                        {formatArea(apartment.area)}
                    </p>
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Adresse
                    </p>
                    <p className="mt-1 truncate font-semibold text-slate-900">
                        {apartment.building_address ?? '-'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function InviteUserForm({ invitableRoles, availableApartments, config }) {
    const roleOptions =
        invitableRoles.length > 0 ? invitableRoles : ['Coproprietaire'];
    const apartmentOptions = Array.isArray(availableApartments)
        ? availableApartments
        : [];
    const hasAvailableApartments = apartmentOptions.length > 0;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone_number: '',
        role: roleOptions[0],
        apartment_id: '',
    });
    const selectedApartment = apartmentOptions.find(
        (apartment) => String(apartment.id) === String(data.apartment_id),
    );

    const submit = (event) => {
        event.preventDefault();

        post(route(`${config.route}.store`), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title="Inviter un utilisateur"
            subtitle="Création d'un compte résident avec affectation directe à un lot libre."
            toolbar={
                <Link
                    href={route(`${config.route}.index`)}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132]"
                >
                    Retour à la liste
                </Link>
            }
        >
            <Head title="Inviter un utilisateur" />

            <div className="mx-auto max-w-6xl">
                <form
                    onSubmit={submit}
                    className="overflow-hidden rounded-lg border border-white/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                    <div className="bg-[#0F5132] px-4 py-5 text-white sm:px-6">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-100/80">
                            Nouveau résident
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold">
                            Invitation et logement
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/75">
                            Le membre recevra son lien d'activation et le lot choisi passera automatiquement en statut occupé.
                        </p>
                    </div>

                    <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <section className="rounded-lg border border-slate-100 bg-white p-4 sm:p-5">
                            <div className="mb-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#386146]">
                                    Identité
                                </p>
                                <h3 className="mt-1 text-lg font-semibold text-slate-950">
                                    Informations utilisateur
                                </h3>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <InviteField id="name" label="Nom complet" required error={errors.name}>
                                    <TextInput
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="mt-0 block w-full"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="Ex. Oumayma Zoheri"
                                        required
                                        isFocused
                                    />
                                </InviteField>

                                <InviteField
                                    id="email"
                                    label="Adresse e-mail"
                                    required
                                    error={errors.email}
                                    helper="Le lien d'activation sera envoyé à cette adresse."
                                >
                                    <TextInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="mt-0 block w-full"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        placeholder="nom@example.com"
                                        required
                                    />
                                </InviteField>

                                <InviteField
                                    id="phone_number"
                                    label="Téléphone"
                                    error={errors.phone_number}
                                    helper="Champ optionnel."
                                >
                                    <TextInput
                                        id="phone_number"
                                        name="phone_number"
                                        type="tel"
                                        className="mt-0 block w-full"
                                        value={data.phone_number}
                                        onChange={(event) => setData('phone_number', event.target.value)}
                                        placeholder="Ex. 06 12 34 56 78"
                                    />
                                </InviteField>

                                <InviteField
                                    id="role"
                                    label="Rôle"
                                    required
                                    error={errors.role}
                                    helper="Invitation réservée aux copropriétaires et locataires."
                                >
                                    <select
                                        id="role"
                                        name="role"
                                        className="block min-h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                        value={data.role}
                                        onChange={(event) => setData('role', event.target.value)}
                                        required
                                    >
                                        {roleOptions.map((role) => (
                                            <option key={role} value={role}>
                                                {roleLabel(role)}
                                            </option>
                                        ))}
                                    </select>
                                </InviteField>
                            </div>
                        </section>

                        <section className="rounded-lg border border-slate-100 bg-white p-4 sm:p-5">
                            <div className="mb-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#386146]">
                                    Logement
                                </p>
                                <h3 className="mt-1 text-lg font-semibold text-slate-950">
                                    Affectation du lot
                                </h3>
                            </div>

                            <div className="space-y-5">
                                <InviteField
                                    id="apartment_id"
                                    label="Lot associé"
                                    required
                                    error={errors.apartment_id}
                                    helper={
                                        hasAvailableApartments
                                            ? 'Seuls les lots libres sont proposés.'
                                            : "Créez ou libérez un lot avant d'inviter un résident."
                                    }
                                >
                                    <select
                                        id="apartment_id"
                                        name="apartment_id"
                                        className="block min-h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
                                        value={data.apartment_id}
                                        onChange={(event) => setData('apartment_id', event.target.value)}
                                        required
                                        disabled={!hasAvailableApartments}
                                    >
                                        <option value="">Sélectionner un lot libre</option>
                                        {apartmentOptions.map((apartment) => (
                                            <option key={apartment.id} value={apartment.id}>
                                                {apartment.label}
                                            </option>
                                        ))}
                                    </select>
                                </InviteField>

                                <ApartmentPreview
                                    apartment={selectedApartment}
                                    hasAvailableApartments={hasAvailableApartments}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-100 px-4 py-4 sm:gap-3 sm:px-6">
                        <PrimaryButton
                            disabled={
                                processing ||
                                !hasAvailableApartments ||
                                !data.apartment_id
                            }
                        >
                            Envoyer l'invitation
                        </PrimaryButton>
                        <Link
                            href={route(`${config.route}.index`)}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition duration-150 ease-in-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:text-xs"
                        >
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

export default function Form({
    user,
    invitableRoles = ['Coproprietaire', 'Locataire'],
    availableApartments = [],
}) {
    const config = resourceConfigs.users;
    const isEditing = Boolean(user);

    if (!isEditing) {
        return (
            <InviteUserForm
                invitableRoles={invitableRoles}
                availableApartments={availableApartments}
                config={config}
            />
        );
    }

    const defaults = config.toFormData(user);

    return (
        <CrudFormPage
            title={`Modifier ${config.singular}`}
            resource={config.route}
            fields={config.formFields}
            defaults={defaults}
            action={route(`${config.route}.update`, user.id)}
            method="put"
            submitLabel={`Mettre à jour ${config.singular}`}
        />
    );
}
