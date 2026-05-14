import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ buildings }) {
    const config = resourceConfigs.buildings;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={buildings}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`New ${config.singular}`}
        />
    );
}
