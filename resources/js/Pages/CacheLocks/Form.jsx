import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ cacheLock }) {
    const config = resourceConfigs.cacheLocks;
    const defaults = config.toFormData(cacheLock);

    return (
        <CrudFormPage
            title={cacheLock ? `Modifier ${config.singular}` : `Créer ${config.singular}`}
            resource={config.route}
            fields={config.formFields}
            defaults={defaults}
            action={
                cacheLock
                    ? route(`${config.route}.update`, cacheLock.key)
                    : route(`${config.route}.store`)
            }
            method={cacheLock ? 'put' : 'post'}
            submitLabel={cacheLock ? `Mettre à jour ${config.singular}` : `Créer ${config.singular}`}
        />
    );
}
