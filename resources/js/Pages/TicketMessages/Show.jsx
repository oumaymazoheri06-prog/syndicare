import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ ticketMessage }) {
    const config = resourceConfigs.ticketMessages;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={ticketMessage}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
