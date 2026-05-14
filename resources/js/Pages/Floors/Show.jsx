import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ floor }) {
    const config = resourceConfigs.floors;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={floor}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
