import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ notification, users }) {
    const config = resourceConfigs.notifications;
    const fields = config.formFields.map((field) =>
        field.name === 'user_id'
            ? { ...field, options: asOptions(users, 'id', 'name') }
            : field,
    );
    const defaults = config.toFormData(notification);

    return (
        <CrudFormPage
            title={notification ? `Edit ${config.singular}` : `Create ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                notification
                    ? route(`${config.route}.update`, notification.id)
                    : route(`${config.route}.store`)
            }
            method={notification ? 'put' : 'post'}
            submitLabel={notification ? `Update ${config.singular}` : `Create ${config.singular}`}
        />
    );
}
