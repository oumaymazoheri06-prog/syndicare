import { CrudShowPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ payment }) {
    const config = resourceConfigs.payments;
    const { auth } = usePage().props;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={payment}
            fields={config.showFields}
            routeKey={config.routeKey}
            canEdit={auth?.user?.role === 'Syndic'}
        />
    );
}
