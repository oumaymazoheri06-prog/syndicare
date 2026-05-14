import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ receipts }) {
    const config = resourceConfigs.receipts;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={receipts}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`New ${config.singular}`}
        />
    );
}
