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
    authLinkClass,
    authTitleClass,
} from '@/Layouts/authStyles';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Create your account</h1>
                <p className={authDescriptionClass}>
                    Join the platform to manage your residence and stay
                    connected.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Name"
                        className={authLabelClass}
                    />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className={authInputClass}
                        autoComplete="name"
                        isFocused={false}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className={authLabelClass}
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={authInputClass}
                        autoComplete="username"
                        
                        onChange={(e) => setData("email", e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password"
                        className={authLabelClass}
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={authInputClass}
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className={authLabelClass}
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={authInputClass}
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={route("login")} className={authLinkClass}>
                        Already registered?
                    </Link>

                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
