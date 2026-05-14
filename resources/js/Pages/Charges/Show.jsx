import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ charge }) {
    const config = resourceConfigs.charges;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={charge}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
