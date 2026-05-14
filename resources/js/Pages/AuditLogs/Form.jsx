import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ auditLog }) {
    const config = resourceConfigs.auditLogs;
    const defaults = config.toFormData(auditLog);

    return (
        <CrudFormPage
            title={auditLog ? `Edit ${config.singular}` : `Create ${config.singular}`}
            resource={config.route}
            fields={config.formFields}
            defaults={defaults}
            action={
                auditLog
                    ? route(`${config.route}.update`, auditLog.id)
                    : route(`${config.route}.store`)
            }
            method={auditLog ? 'put' : 'post'}
            submitLabel={auditLog ? `Update ${config.singular}` : `Create ${config.singular}`}
        />
    );
}
