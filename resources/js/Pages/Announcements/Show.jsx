import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ announcement }) {
    const config = resourceConfigs.announcements;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={announcement}
            fields={config.showFields}
            routeKey={config.routeKey}
        />
    );
}
