import { CrudFormPage } from "@/Components/CrudScaffold";
import { resourceConfigs } from "../_shared/resources";

export default function Form({ announcement, buildings = [] }) {
    const config = resourceConfigs.announcements;
    const defaults = config.toFormData(announcement);

    // Inject buildings dynamically into the building_id field
    const fields = config.formFields.map((field) =>
        field.name === "building_id"
            ? {
                  ...field,
                  options: [
                      { value: "", label: "Tous les immeubles" },
                      ...buildings.map((b) => ({ value: b.id, label: b.name })),
                  ],
              }
            : field,
    );

    return (
        <CrudFormPage
            title={
                announcement
                    ? `Modifier ${config.singular}`
                    : `Créer ${config.singular}`
            }
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                announcement
                    ? route(`${config.route}.update`, announcement.id)
                    : route(`${config.route}.store`)
            }
            method={announcement ? "put" : "post"}
            submitLabel={
                announcement
                    ? `Mettre à jour ${config.singular}`
                    : `Créer ${config.singular}`
            }
        />
    );
}
