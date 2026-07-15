import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ building }) {
    const config = resourceConfigs.buildings;
    const defaults = config.toFormData(building);

    return (
        <CrudFormPage
            title={building ? `Modifier ${config.singular}` : `Créer ${config.singular}`}
            resource={config.route}
            fields={config.formFields}
            defaults={defaults}
            action={
                building
                    ? route(`${config.route}.update`, building.id)
                    : route(`${config.route}.store`)
            }
            method={building ? 'put' : 'post'}
            submitLabel={building ? `Mettre à jour ${config.singular}` : `Créer ${config.singular}`}
        />
    );
}
