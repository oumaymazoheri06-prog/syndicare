import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ document, buildings = [], apartments = [] }) {
    const config = resourceConfigs.documents;
    const fields = config.formFields.map((field) => {
        if (field.name === 'building_id') {
            return {
                ...field,
                options: buildings.map((building) => ({
                    value: building.id,
                    label: building.name,
                })),
            };
        }

        if (field.name === 'apartment_id') {
            return {
                ...field,
                options: apartments.map((apartment) => ({
                    value: apartment.id,
                    label: apartment.label ?? apartment.number,
                })),
            };
        }

        return field;
    });
    const defaults = config.toFormData(document);

    return (
        <CrudFormPage
            title={document ? `Modifier ${config.singular}` : `Créer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                document
                    ? route(`${config.route}.update`, document.id)
                    : route(`${config.route}.store`)
            }
            method={document ? 'put' : 'post'}
            submitLabel={document ? `Mettre à jour ${config.singular}` : `Créer ${config.singular}`}
        />
    );
}
