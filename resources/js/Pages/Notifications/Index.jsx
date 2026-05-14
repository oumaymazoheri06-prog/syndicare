import { CrudIndexPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ notifications }) {
    const config = resourceConfigs.notifications;
    const { auth } = usePage().props;
    const canManage = auth?.user?.role === 'Syndic';

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={notifications}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel="Nouvelle alerte"
            canCreate={canManage}
            canEdit={canManage}
            canDelete={canManage}
        />
    );
}
