import { CrudShowPage } from '@/Components/CrudScaffold';
import { Link, usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ notification }) {
    const config = resourceConfigs.notifications;
    const { auth } = usePage().props;
    const canManage = auth?.user?.role === 'Syndic';
    const markRoute = notification.is_read
        ? route('notifications.mark-unread', notification.id)
        : route('notifications.mark-read', notification.id);

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={notification}
            fields={config.showFields}
            routeKey={config.routeKey}
            canEdit={canManage}
            actions={
                <Link
                    href={markRoute}
                    method="patch"
                    as="button"
                    preserveScroll
                    className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold shadow-sm transition ${
                        notification.is_read
                            ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                    {notification.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                </Link>
            }
        />
    );
}
