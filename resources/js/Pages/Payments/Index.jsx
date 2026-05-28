import { CrudIndexPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ payments }) {
    const config = resourceConfigs.payments;
    const { auth } = usePage().props;
    const canManagePayments = auth?.user?.role === 'Syndic';

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={payments}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canEdit={canManagePayments}
            canDelete={canManagePayments}
        />
    );
}
