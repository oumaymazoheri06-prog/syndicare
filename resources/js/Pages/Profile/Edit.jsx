import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AdminLayout
            title="Profil"
            subtitle="Informations du compte, securite et preferences d'acces."
        >
            <Head title="Profil" />

            <div className="mx-auto max-w-7xl space-y-6">
                <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </section>

                <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </section>

                <section className="rounded-[2rem] border border-white/80 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </section>
            </div>
        </AdminLayout>
    );
}
