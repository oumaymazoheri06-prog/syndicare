import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ expense, buildings }) {
    const config = resourceConfigs.expenses;
    const fields = config.formFields.map((field) =>
        field.name === 'building_id'
            ? { ...field, options: asOptions(buildings, 'id', 'name') }
            : field,
    );
    const defaults = config.toFormData(expense);

    return (
        <CrudFormPage
            title={expense ? `Edit ${config.singular}` : `Create ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                expense
                    ? route(`${config.route}.update`, expense.id)
                    : route(`${config.route}.store`)
            }
            method={expense ? 'put' : 'post'}
            submitLabel={expense ? `Update ${config.singular}` : `Create ${config.singular}`}
        />
    );
}
