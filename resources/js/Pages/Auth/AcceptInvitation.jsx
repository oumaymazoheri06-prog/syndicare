import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    authButtonInlineClass,
    authDescriptionClass,
    authEyebrowClass,
    authInputClass,
    authLabelClass,
    authStatusClass,
    authTitleClass,
} from '@/Layouts/authStyles';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AcceptInvitation({
    token,
    email,
    name,
    expiresAt,
    canAccept,
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        if (!canAccept) {
            return;
        }

        post(route('invitations.store', token), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Activer le compte" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Activer votre compte</h1>
                <p className={authDescriptionClass}>
                    {canAccept
                        ? `Bonjour ${name ?? ''}, choisissez votre mot de passe pour acceder a votre espace.`
                        : 'Cette invitation est invalide ou expiree.'}
                </p>
            </div>

            {canAccept && (
                <div className={authStatusClass}>
                    Login : {email}
                    {expiresAt ? ` - expire le ${expiresAt}` : ''}
                </div>
            )}

            {!canAccept && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
                    Demandez une nouvelle invitation a votre syndic.
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Mot de passe"
                        className={authLabelClass}
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={authInputClass}
                        autoComplete="new-password"
                        isFocused={true}
                        disabled={!canAccept}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmer le mot de passe"
                        className={authLabelClass}
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={authInputClass}
                        autoComplete="new-password"
                        disabled={!canAccept}
                        onChange={(event) =>
                            setData(
                                'password_confirmation',
                                event.target.value,
                            )
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-sky-700 transition hover:text-sky-800 hover:underline"
                    >
                        Connexion
                    </Link>

                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing || !canAccept}
                    >
                        Activer
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
