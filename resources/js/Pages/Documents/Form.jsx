import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ document }) {
    const config = resourceConfigs.documents;
    const defaults = config.toFormData(document);

    return (
        <CrudFormPage
            title={document ? `Edit ${config.singular}` : `Create ${config.singular}`}
            resource={config.route}
            fields={config.formFields}
            defaults={defaults}
            action={
                document
                    ? route(`${config.route}.update`, document.id)
                    : route(`${config.route}.store`)
            }
            method={document ? 'put' : 'post'}
            submitLabel={document ? `Update ${config.singular}` : `Create ${config.singular}`}
        />
    );
}
