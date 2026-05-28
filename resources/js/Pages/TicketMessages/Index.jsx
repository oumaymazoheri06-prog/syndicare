import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ ticketMessages }) {
    const config = resourceConfigs.ticketMessages;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={ticketMessages}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
        />
    );
}
