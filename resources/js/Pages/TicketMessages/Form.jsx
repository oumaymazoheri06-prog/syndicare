import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ ticketMessage, tickets }) {
    const config = resourceConfigs.ticketMessages;
    const fields = config.formFields.map((field) =>
        field.name === 'ticket_id'
            ? { ...field, options: asOptions(tickets, 'id', 'title') }
            : field,
    );
    const defaults = config.toFormData(ticketMessage);

    return (
        <CrudFormPage
            title={
                ticketMessage
                    ? `Edit ${config.singular}`
                    : `Create ${config.singular}`
            }
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                ticketMessage
                    ? route(`${config.route}.update`, ticketMessage.id)
                    : route(`${config.route}.store`)
            }
            method={ticketMessage ? 'put' : 'post'}
            submitLabel={
                ticketMessage ? `Update ${config.singular}` : `Create ${config.singular}`
            }
        />
    );
}
