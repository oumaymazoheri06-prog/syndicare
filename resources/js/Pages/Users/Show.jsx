import { CrudShowPage } from '@/Components/CrudScaffold';
import { Link } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ user }) {
    const config = resourceConfigs.users;
    const actions = user.can_resend_invitation ? (
        <Link
            href={route('users.invitation.resend', user.id)}
            method="post"
            as="button"
            className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 shadow-sm transition hover:bg-sky-100"
        >
            Renvoyer l'invitation
        </Link>
    ) : null;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={user}
            fields={config.showFields}
            routeKey={config.routeKey}
            actions={actions}
        />
    );
}
