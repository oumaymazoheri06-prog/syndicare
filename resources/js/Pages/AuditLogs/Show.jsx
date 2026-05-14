import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ auditLog }) {
    const config = resourceConfigs.auditLogs;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={auditLog}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
