import InputError from '@/Components/InputError';
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
import { Head, useForm } from '@inertiajs/react';

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
            <Head title="Forgot Password" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Forgot password</h1>
                <p className={authDescriptionClass}>
                    Forgot your password? Enter your email address and we will
                    send you a reset link.
                </p>
            </div>

            {status && <div className={authStatusClass}>{status}</div>}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className={authLabelClass}>
                        Email
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

                <div className="flex items-center justify-end">
                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
