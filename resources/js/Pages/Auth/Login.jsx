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

const DEMO_PASSWORD = 'Demo@2026';
const demoAccounts = [
    { role: 'Syndic', email: 'demo@syndicare.ma' },
    { role: 'Coproprietaire', email: 'copro.demo@syndicare.ma' },
    { role: 'Locataire', email: 'locataire.demo@syndicare.ma' },
];

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const fillDemoAccount = (account) => {
        setData({
            ...data,
            email: account.email,
            password: DEMO_PASSWORD,
            remember: false,
        });
    };

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

            <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-black text-emerald-950">
                        Compte demo public
                    </p>
                    <p className="text-xs font-medium leading-5 text-emerald-900">
                        Selectionnez un profil pour remplir le formulaire.
                    </p>
                </div>

                <div className="mt-3 grid gap-2">
                    {demoAccounts.map((account) => (
                        <button
                            key={account.email}
                            type="button"
                            onClick={() => fillDemoAccount(account)}
                            className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-left text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                        >
                            <span className="shrink-0 text-emerald-800">
                                {account.role}
                            </span>
                            <span className="min-w-0 break-all font-mono text-[11px] font-semibold text-slate-500">
                                {account.email}
                            </span>
                        </button>
                    ))}
                </div>

                <p className="mt-3 text-xs font-semibold text-emerald-950">
                    Mot de passe:{' '}
                    <span className="font-mono">{DEMO_PASSWORD}</span>
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className={authLabelClass}>
                        E-mail
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
