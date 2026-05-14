import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ cacheLock }) {
    const config = resourceConfigs.cacheLocks;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={cacheLock}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
