import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ document }) {
    const config = resourceConfigs.documents;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={document}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
