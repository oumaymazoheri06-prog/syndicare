import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ users }) {
    const config = resourceConfigs.users;

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={users}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel="Inviter un utilisateur"
        />
    );
}
