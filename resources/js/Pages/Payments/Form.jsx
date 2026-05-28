import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ payment, charges }) {
    const config = resourceConfigs.payments;
    const fields = config.formFields.map((field) =>
        field.name === 'charge_id'
            ? { ...field, options: asOptions(charges, 'id', 'description') }
            : field,
    );
    const defaults = config.toFormData(payment);

    return (
        <CrudFormPage
            title={payment ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                payment
                    ? route(`${config.route}.update`, payment.id)
                    : route(`${config.route}.store`)
            }
            method={payment ? 'put' : 'post'}
            submitLabel={payment ? `Mettre a jour ${config.singular}` : `Creer ${config.singular}`}
        />
    );
}
