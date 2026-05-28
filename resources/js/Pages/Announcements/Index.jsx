import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { CrudIndexPage } from "@/Components/CrudScaffold";
import { resourceConfigs } from "../_shared/resources";

export default function Index({ announcements }) {
    const config = resourceConfigs.announcements;
    const { auth } = usePage().props;
    const user = auth.user;
    const canManageAnnouncements = user?.role === "Syndic";

    const [items, setItems] = useState(announcements);

    useEffect(() => {
        if (!user || !window.Echo) {
            return;
        }

        const { role } = user;
        const buildingIds = auth.building_ids?.length ? auth.building_ids : [];
        const channels = new Set([`building.all.all`, `building.all.${role}`]);

        buildingIds.forEach((buildingId) => {
            channels.add(`building.${buildingId}.all`);
            channels.add(`building.${buildingId}.${role}`);
        });

        channels.forEach((channel) => {
            window.Echo.private(channel).listen(
                ".announcement.created",
                (newAnnouncement) => {
                    setItems((prev) => ({
                        ...prev,
                        data: [newAnnouncement, ...prev.data],
                    }));
                },
            );
        });

        return () => {
            channels.forEach((channel) => window.Echo.leave(channel));
        };
    }, [auth.building_ids, user]);

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={items}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageAnnouncements}
            canEdit={canManageAnnouncements}
            canDelete={canManageAnnouncements}
        />
    );
}
