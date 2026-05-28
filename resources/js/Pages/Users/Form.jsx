import { CrudFormPage } from '@/Components/CrudScaffold';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

function roleLabel(role) {
    return role === 'Coproprietaire' ? 'Coproprietaire' : role;
}

function InviteField({
    id,
    label,
    required = false,
    error,
    helper,
    children,
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-slate-800"
            >
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

function InviteUserForm({ invitableRoles, config }) {
    const roleOptions =
        invitableRoles.length > 0 ? invitableRoles : ['Coproprietaire'];
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone_number: '',
        role: roleOptions[0],
    });

    const submit = (event) => {
        event.preventDefault();

        post(route(`${config.route}.store`), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title="Inviter un utilisateur"
            subtitle="Ajoutez un coproprietaire ou un locataire et envoyez-lui son lien d activation."
            toolbar={
                <Link
                    href={route(`${config.route}.index`)}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0e3715]"
                >
                    Retour a la liste
                </Link>
            }
        >
            <Head title="Inviter un utilisateur" />

            <div className="mx-auto max-w-4xl">
                <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                    <div className="border-b border-emerald-100 bg-[#f7f4ee] px-4 py-5 sm:px-6">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#386146]">
                            Nouveau compte
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                            Informations de l utilisateur
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Le compte sera cree sans mot de passe manuel. Un
                            e-mail d invitation permettra a l utilisateur de
                            choisir son mot de passe.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <InviteField
                                id="name"
                                label="Nom complet"
                                required
                                error={errors.name}
                            >
                                <TextInput
                                    id="name"
                                    name="name"
                                    type="text"
                                    className="mt-0 block w-full"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
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
                                helper="Le lien d activation sera envoye a cette adresse."
                            >
                                <TextInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="mt-0 block w-full"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    placeholder="nom@example.com"
                                    required
                                />
                            </InviteField>

                            <InviteField
                                id="phone_number"
                                label="Telephone"
                                error={errors.phone_number}
                                helper="Champ optionnel."
                            >
                                <TextInput
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    className="mt-0 block w-full"
                                    value={data.phone_number}
                                    onChange={(event) =>
                                        setData(
                                            'phone_number',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Ex. 06 12 34 56 78"
                                />
                            </InviteField>

                            <InviteField
                                id="role"
                                label="Role"
                                required
                                error={errors.role}
                                helper="Seuls les coproprietaires et locataires peuvent etre invites."
                            >
                                <select
                                    id="role"
                                    name="role"
                                    className="block w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    value={data.role}
                                    onChange={(event) =>
                                        setData('role', event.target.value)
                                    }
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

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-6 text-emerald-900">
                            Apres validation, Syndicare envoie automatiquement
                            une invitation valable 72 heures. Le statut sera
                            visible dans la liste des membres.
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <PrimaryButton disabled={processing}>
                                Envoyer l invitation
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

export default function Form({
    user,
    invitableRoles = ['Coproprietaire', 'Locataire'],
}) {
    const config = resourceConfigs.users;
    const isEditing = Boolean(user);

    if (!isEditing) {
        return (
            <InviteUserForm invitableRoles={invitableRoles} config={config} />
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
            submitLabel={`Mettre a jour ${config.singular}`}
        />
    );
}
