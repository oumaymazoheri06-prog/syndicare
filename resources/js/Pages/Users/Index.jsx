import { useState } from 'react';
import { CrudIndexPage } from '@/Components/CrudScaffold';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ users }) {
    const config = resourceConfigs.users;
    const [roleFilter, setRoleFilter] = useState('all');
    const filteredUsers = {
        ...users,
        data:
            roleFilter === 'all'
                ? users.data
                : users.data.filter((user) => user.role === roleFilter),
    };

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={filteredUsers}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel="Inviter un utilisateur"
            filters={
                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="all">Tous les membres</option>
                    <option value="Locataire">Locataires</option>
                    <option value="Coproprietaire">Coproprietaires</option>
                </select>
            }
        />
    );
}
