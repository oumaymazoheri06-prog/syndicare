import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    authButtonWideClass,
    authCheckboxClass,
    authDescriptionClass,
    authEyebrowClass,
    authInputClass,
    authLinkClass,
    authLabelClass,
    authStatusClass,
    authTitleClass,
} from '@/Layouts/authStyles';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            <div className="mb-6">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Bon retour</h1>
                <p className={authDescriptionClass}>
                    Connectez-vous pour gérer votre compte et accéder au tableau de bord.
                </p>
            </div>

            {status && <div className={authStatusClass}>{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className={authLabelClass}>
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData("email", e.target.value)}
                        className={authInputClass}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between gap-4">
                        <label htmlFor="password" className={authLabelClass}>
                            Mot de passe
                        </label>
                    </div>

                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        className={authInputClass}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className={authCheckboxClass}
                        />
                        <span>Se souvenir de moi</span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className={authLinkClass}
                        >
                            Mot de passe oublié ?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={authButtonWideClass}
                >
                    Se connecter
                </button>
            </form>
        </GuestLayout>
    );
}
