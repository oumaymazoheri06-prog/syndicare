import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ expenses }) {
    const config = resourceConfigs.expenses;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={expenses}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
        />
    );
}
