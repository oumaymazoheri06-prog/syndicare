import { CrudFormPage } from '@/Components/CrudScaffold';
import { usePage } from '@inertiajs/react';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ ticket, users }) {
    const config = resourceConfigs.tickets;
    const { auth } = usePage().props;
    const isSyndic = auth?.user?.role === 'Syndic';
    const isEditing = Boolean(ticket);
    const residentFields = config.formFields.filter((field) =>
        ['title', 'description'].includes(field.name),
    );
    const syndicFields = config.formFields.map((field) =>
        field.name === 'assigned_to'
            ? { ...field, options: asOptions(users, 'id', 'name') }
            : field,
    );
    const fields = isSyndic && isEditing ? syndicFields : residentFields;
    const defaults = config.toFormData(ticket);

    return (
        <CrudFormPage
            title={
                ticket
                    ? `Modifier ${config.singular}`
                    : 'Déclarer un problème'
            }
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                ticket
                    ? route(`${config.route}.update`, ticket.id)
                    : route(`${config.route}.store`)
            }
            method={ticket ? 'put' : 'post'}
            submitLabel={ticket ? `Mettre à jour ${config.singular}` : 'Envoyer la demande'}
        />
    );
}
