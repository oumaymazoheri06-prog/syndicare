import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ documents }) {
    const config = resourceConfigs.documents;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={documents}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`New ${config.singular}`}
        />
    );
}
