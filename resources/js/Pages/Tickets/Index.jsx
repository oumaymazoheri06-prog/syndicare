import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ tickets }) {
    const config = resourceConfigs.tickets;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={tickets}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`New ${config.singular}`}
        />
    );
}
