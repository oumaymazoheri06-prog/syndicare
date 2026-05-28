import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ auditLogs }) {
    const config = resourceConfigs.auditLogs;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={auditLogs}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
        />
    );
}
