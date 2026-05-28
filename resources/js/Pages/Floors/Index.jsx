import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ floors }) {
    const config = resourceConfigs.floors;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={floors}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
        />
    );
}
