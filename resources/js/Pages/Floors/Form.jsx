import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ floor, buildings }) {
    const config = resourceConfigs.floors;
    const fields = config.formFields.map((field) =>
        field.name === 'building_id'
            ? { ...field, options: asOptions(buildings, 'id', 'name') }
            : field,
    );
    const defaults = config.toFormData(floor);

    return (
        <CrudFormPage
            title={floor ? `Edit ${config.singular}` : `Create ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                floor
                    ? route(`${config.route}.update`, floor.id)
                    : route(`${config.route}.store`)
            }
            method={floor ? 'put' : 'post'}
            submitLabel={floor ? `Update ${config.singular}` : `Create ${config.singular}`}
        />
    );
}
