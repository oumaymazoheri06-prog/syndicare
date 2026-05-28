import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ charge, apartments }) {
    const config = resourceConfigs.charges;
    const fields = config.formFields.map((field) =>
        field.name === 'apartment_id'
            ? { ...field, options: asOptions(apartments, 'id', 'number') }
            : field,
    );
    const defaults = config.toFormData(charge);

    return (
        <CrudFormPage
            title={charge ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                charge
                    ? route(`${config.route}.update`, charge.id)
                    : route(`${config.route}.store`)
            }
            method={charge ? 'put' : 'post'}
            submitLabel={charge ? `Mettre a jour ${config.singular}` : `Creer ${config.singular}`}
        />
    );
}
