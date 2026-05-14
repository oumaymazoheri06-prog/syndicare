import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ building }) {
    const config = resourceConfigs.buildings;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={building}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
