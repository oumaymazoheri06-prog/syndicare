import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ receipt }) {
    const config = resourceConfigs.receipts;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={receipt}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
