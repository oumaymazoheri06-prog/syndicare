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
            <Head title="Email Verification" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Verify your email</h1>
                <p className={authDescriptionClass}>
                    Thanks for signing up. Please verify your email address to
                    continue.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className={authStatusClass}>
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between gap-4">
                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Resend Verification Email
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={authLinkClass}
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
