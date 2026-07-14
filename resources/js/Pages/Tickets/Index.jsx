import { CrudIndexPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ tickets }) {
    const config = resourceConfigs.tickets;
    const { auth } = usePage().props;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={tickets}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel="Déclarer un problème"
            canCreate={auth?.user?.role !== 'Syndic'}
            canDelete={auth?.user?.role === 'Syndic'}
        />
    );
}
