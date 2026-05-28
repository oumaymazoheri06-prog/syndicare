import { CrudIndexPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ charges }) {
    const config = resourceConfigs.charges;
    const { auth } = usePage().props;
    const canManageCharges = auth?.user?.role === 'Syndic';

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={charges}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageCharges}
            canEdit={canManageCharges}
            canDelete={canManageCharges}
        />
    );
}
