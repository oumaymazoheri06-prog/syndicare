import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    authButtonInlineClass,
    authDescriptionClass,
    authEyebrowClass,
    authLinkClass,
    authStatusClass,
    authTitleClass,
} from '@/Layouts/authStyles';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Vérification e-mail" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Vérifiez votre e-mail</h1>
                <p className={authDescriptionClass}>
                    Merci pour votre inscription. Vérifiez votre adresse e-mail pour continuer.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className={authStatusClass}>
                    Un nouveau lien de vérification a été envoyé à l'adresse e-mail fournie.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between gap-4">
                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Renvoyer l'e-mail de vérification
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={authLinkClass}
                    >
                        Déconnexion
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
