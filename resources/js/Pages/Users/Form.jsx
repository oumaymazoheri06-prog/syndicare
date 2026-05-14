import { CrudFormPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Form({ user, invitableRoles = ['Coproprietaire', 'Locataire'] }) {
    const config = resourceConfigs.users;
    const isEditing = Boolean(user);
    const fields = isEditing
        ? config.formFields
        : config.formFields
              .filter(
                  (field) =>
                      !['password', 'password_confirmation'].includes(
                          field.name,
                      ),
              )
              .map((field) =>
                  field.name === 'role'
                      ? { ...field, options: invitableRoles }
                      : field,
              );
    const defaults = config.toFormData(user);

    return (
        <CrudFormPage
            title={isEditing ? `Edit ${config.singular}` : 'Inviter un utilisateur'}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                isEditing
                    ? route(`${config.route}.update`, user.id)
                    : route(`${config.route}.store`)
            }
            method={isEditing ? 'put' : 'post'}
            submitLabel={isEditing ? `Update ${config.singular}` : 'Envoyer invitation'}
        />
    );
}
