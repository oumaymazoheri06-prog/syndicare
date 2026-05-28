import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ cacheLocks }) {
    const config = resourceConfigs.cacheLocks;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={cacheLocks}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
        />
    );
}
