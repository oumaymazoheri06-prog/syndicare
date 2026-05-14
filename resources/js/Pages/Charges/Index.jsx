import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ charges }) {
    const config = resourceConfigs.charges;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={charges}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`New ${config.singular}`}
        />
    );
}
