import { CrudShowPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ announcement }) {
    const config = resourceConfigs.announcements;
    const { auth } = usePage().props;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={announcement}
            fields={config.showFields}
            routeKey={config.routeKey}
            canEdit={auth?.user?.role === 'Syndic'}
        />
    );
}
