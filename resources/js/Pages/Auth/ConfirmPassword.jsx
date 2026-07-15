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
    authTitleClass,
} from '@/Layouts/authStyles';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirmation du mot de passe" />

            <div className="mb-8">
                <p className={authEyebrowClass}>Syndicare</p>
                <h1 className={authTitleClass}>Confirmer le mot de passe</h1>
                <p className={authDescriptionClass}>
                    Cette zone est sécurisée. Confirmez votre mot de passe pour continuer.
                </p>
            </div>

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
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-end">
                    <PrimaryButton
                        className={authButtonInlineClass}
                        disabled={processing}
                    >
                        Confirmer
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
