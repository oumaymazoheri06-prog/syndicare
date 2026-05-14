import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ payments }) {
    const config = resourceConfigs.payments;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={payments}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`New ${config.singular}`}
        />
    );
}
