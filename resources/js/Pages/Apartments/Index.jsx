import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ apartments }) {
    const config = resourceConfigs.apartments;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={apartments}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
        />
    );
}
