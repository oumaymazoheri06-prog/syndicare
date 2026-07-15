import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    authButtonInlineClass,
    authDescriptionClass,
    authEyebrowClass,
    authInputClass,
    authLinkClass,
    authLabelClass,
    authStatusClass,
    authTitleClass,
} from '@/Layouts/authStyles';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Mot de passe oublié" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Mot de passe oublié</h1>
                <p className={authDescriptionClass}>
                    Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.
                </p>
            </div>

            {status && <div className={authStatusClass}>{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className={authLabelClass}>
                        E-mail
                    </label>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={authInputClass}
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={route('login')} className={authLinkClass}>
                        Retour
                    </Link>

                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Envoyer le lien de réinitialisation
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
