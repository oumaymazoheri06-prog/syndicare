import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import UserAvatar from '@/Components/UserAvatar';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const isSyndic = user.role === 'Syndic';
    const photoInput = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone_number: user.phone_number || '',
            payment_rib: user.payment_rib || '',
        });
    const {
        data: photoData,
        setData: setPhotoData,
        post: postPhoto,
        delete: deletePhoto,
        reset: resetPhoto,
        errors: photoErrors,
        processing: photoProcessing,
        recentlySuccessful: photoRecentlySuccessful,
    } = useForm({
        profile_photo: null,
    });

    useEffect(() => {
        if (!photoData.profile_photo) {
            setPreviewUrl(null);
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(photoData.profile_photo);
        setPreviewUrl(nextPreviewUrl);

        return () => URL.revokeObjectURL(nextPreviewUrl);
    }, [photoData.profile_photo]);

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    const clearPhotoSelection = () => {
        resetPhoto('profile_photo');

        if (photoInput.current) {
            photoInput.current.value = '';
        }
    };

    const submitPhoto = (e) => {
        e.preventDefault();

        if (!photoData.profile_photo) {
            return;
        }

        postPhoto(route('profile.photo.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: clearPhotoSelection,
        });
    };

    const removePhoto = () => {
        deletePhoto(route('profile.photo.destroy'), {
            preserveScroll: true,
            onSuccess: clearPhotoSelection,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informations du profil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Mettez à jour les informations de votre compte et votre adresse e-mail.
                </p>
            </header>

            <form
                onSubmit={submitPhoto}
                className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <UserAvatar
                        user={user}
                        src={previewUrl}
                        size="xl"
                        className="ring-2 ring-white"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                            Photo de profil
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            JPG, PNG ou WebP. Taille maximale 2 Mo.
                        </p>

                        <input
                            ref={photoInput}
                            id="profile_photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={(event) =>
                                setPhotoData(
                                    'profile_photo',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                        />

                        <div className="mt-4 flex flex-wrap items-center gap-2.5">
                            <label
                                htmlFor="profile_photo"
                                className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                            >
                                Choisir une photo
                            </label>

                            <PrimaryButton
                                type="submit"
                                disabled={photoProcessing || !photoData.profile_photo}
                            >
                                Enregistrer la photo
                            </PrimaryButton>

                            {photoData.profile_photo && (
                                <SecondaryButton
                                    type="button"
                                    disabled={photoProcessing}
                                    onClick={clearPhotoSelection}
                                >
                                    Annuler
                                </SecondaryButton>
                            )}

                            {user.profile_photo_url && (
                                <SecondaryButton
                                    type="button"
                                    disabled={photoProcessing}
                                    onClick={removePhoto}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                >
                                    Supprimer
                                </SecondaryButton>
                            )}
                        </div>

                        <InputError className="mt-2" message={photoErrors.profile_photo} />

                        <Transition
                            show={photoRecentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="mt-2 text-sm text-gray-600">
                                Photo enregistree.
                            </p>
                        </Transition>
                    </div>
                </div>
            </form>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nom" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="E-mail" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="phone_number" value="Téléphone" />

                    <TextInput
                        id="phone_number"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.phone_number}
                        onChange={(e) => setData('phone_number', e.target.value)}
                        autoComplete="tel"
                    />

                    <InputError className="mt-2" message={errors.phone_number} />
                </div>

                {isSyndic && (
                    <div>
                        <InputLabel htmlFor="payment_rib" value="RIB de paiement" />

                        <TextInput
                            id="payment_rib"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.payment_rib}
                            onChange={(e) => setData('payment_rib', e.target.value)}
                            placeholder="Ex: 007 810 0000000000000000 00"
                        />

                        <InputError className="mt-2" message={errors.payment_rib} />
                    </div>
                )}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Votre adresse e-mail n'est pas vérifiée.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Cliquez ici pour renvoyer l'e-mail de vérification.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Un nouveau lien de vérification a été envoyé à votre adresse e-mail.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Enregistrer</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Enregistre.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
