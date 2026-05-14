import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ payment }) {
    const config = resourceConfigs.payments;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={payment}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
