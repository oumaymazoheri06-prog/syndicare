import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ apartment }) {
    const config = resourceConfigs.apartments;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={apartment}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
