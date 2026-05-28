import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ ticket, users }) {
    const config = resourceConfigs.tickets;
    const fields = config.formFields.map((field) =>
        field.name === 'assigned_to'
            ? { ...field, options: asOptions(users, 'id', 'name') }
            : field,
    );
    const defaults = config.toFormData(ticket);

    return (
        <CrudFormPage
            title={ticket ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                ticket
                    ? route(`${config.route}.update`, ticket.id)
                    : route(`${config.route}.store`)
            }
            method={ticket ? 'put' : 'post'}
            submitLabel={ticket ? `Mettre a jour ${config.singular}` : `Creer ${config.singular}`}
        />
    );
}
