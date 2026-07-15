import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs, asOptions } from '../_shared/resources';

export default function Form({ receipt, payments }) {
    const config = resourceConfigs.receipts;
    const fields = config.formFields.map((field) =>
        field.name === 'payment_id'
            ? { ...field, options: asOptions(payments, 'id', 'file_path') }
            : field,
    );
    const defaults = config.toFormData(receipt);

    return (
        <CrudFormPage
            title={receipt ? `Modifier ${config.singular}` : `Créer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                receipt
                    ? route(`${config.route}.update`, receipt.id)
                    : route(`${config.route}.store`)
            }
            method={receipt ? 'put' : 'post'}
            submitLabel={receipt ? `Mettre à jour ${config.singular}` : `Créer ${config.singular}`}
        />
    );
}
