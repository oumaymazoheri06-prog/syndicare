import { CrudIndexPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ documents }) {
    const config = resourceConfigs.documents;
    const { auth } = usePage().props;
    const canManageDocuments = auth?.user?.role === 'Syndic';

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={documents}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageDocuments}
            canEdit={canManageDocuments}
            canDelete={canManageDocuments}
        />
    );
}
