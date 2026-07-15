import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ auth, expenses }) {
    const config = resourceConfigs.expenses;
    const canManageExpenses = auth?.user?.role === 'Syndic';

    return (
        <CrudIndexPage
            title={config.title}
            subtitle={canManageExpenses ? null : 'Consultation des dépenses communiquées par votre syndic.'}
            listDescription={canManageExpenses ? null : 'Consultez les dépenses communes et celles qui concernent vos lots.'}
            resource={config.route}
            items={expenses}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageExpenses}
            canEdit={canManageExpenses}
            canDelete={canManageExpenses}
        />
    );
}
