import { CrudShowPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Show({ auth, expense }) {
    const config = resourceConfigs.expenses;

    return (
        <CrudShowPage
            title={config.title}
            resource={config.route}
            record={expense}
            fields={config.showFields}
            routeKey={config.routeKey}
            canEdit={auth?.user?.role === 'Syndic'}
        />
    );
}
