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
            <Head title="Verification email" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Verifiez votre email</h1>
                <p className={authDescriptionClass}>
                    Merci pour votre inscription. Verifiez votre adresse email pour continuer.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className={authStatusClass}>
                    Un nouveau lien de verification a ete envoye a l adresse email fournie.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between gap-4">
                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Renvoyer l email de verification
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={authLinkClass}
                    >
                        Deconnexion
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
