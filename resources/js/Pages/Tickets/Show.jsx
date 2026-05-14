import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ ticket }) {
    const config = resourceConfigs.tickets;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={ticket}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
