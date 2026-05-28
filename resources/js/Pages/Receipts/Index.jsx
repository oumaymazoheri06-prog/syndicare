import { CrudIndexPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ receipts }) {
    const config = resourceConfigs.receipts;
    const { auth } = usePage().props;
    const canManageReceipts = auth?.user?.role === 'Syndic';

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={receipts}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageReceipts}
            canEdit={canManageReceipts}
            canDelete={canManageReceipts}
        />
    );
}
