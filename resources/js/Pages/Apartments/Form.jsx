import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ apartment, floors, users }) {
    const config = resourceConfigs.apartments;
    const fields = config.formFields.map((field) => {
        if (field.name === 'floor_id') {
            return { ...field, options: asOptions(floors, 'id', 'number') };
        }

        if (field.name === 'user_id') {
            return { ...field, options: asOptions(users, 'id', 'name') };
        }

        return field;
    });
    const defaults = config.toFormData(apartment);

    return (
        <CrudFormPage
            title={apartment ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                apartment
                    ? route(`${config.route}.update`, apartment.id)
                    : route(`${config.route}.store`)
            }
            method={apartment ? 'put' : 'post'}
            submitLabel={apartment ? `Mettre a jour ${config.singular}` : `Creer ${config.singular}`}
        />
    );
}
