import { CrudShowPage } from '@/Components/CrudScaffold';
import { Link, usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ notification }) {
    const config = resourceConfigs.notifications;
    const { auth } = usePage().props;
    const canMarkRead = auth?.user?.id === notification.user_id && !notification.is_read;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={notification}
            fields={config.showFields}
            routeKey={config.routeKey}
            canEdit={false}
            actions={
                canMarkRead ? (
                    <Link
                        href={route('notifications.mark-read', notification.id)}
                        method="patch"
                        as="button"
                        preserveScroll
                        className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                    >
                        Marquer comme lu
                    </Link>
                ) : null
            }
        />
    );
}
