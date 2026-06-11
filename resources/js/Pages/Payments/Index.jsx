import { CrudIndexPage } from '@/Components/CrudScaffold';
import { useI18n } from '@/i18n/I18nProvider';
import { router, usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

const paymentMethodLabels = {
    virement: 'Virement bancaire',
    cashplus: 'Cash Plus',
    manuel: 'Paiement direct au syndic',
};

export default function Index({ payments, buildings = [], filters = {} }) {
    const config = resourceConfigs.payments;
    const { auth } = usePage().props;
    const { t } = useI18n();
    const canManagePayments = auth?.user?.role === 'Syndic';
    const selectedBuildingId = filters.building_id ?? '';
    const columns = [
        {
            key: 'building',
            label: t('Immeuble'),
            render: (_, payment) =>
                payment.charge?.apartment?.floor?.building?.name ?? '-',
        },
        {
            key: 'apartment',
            label: t('Lot'),
            render: (_, payment) => payment.charge?.apartment?.number ?? '-',
        },
        {
            key: 'payer',
            label: t('Payant'),
            render: (_, payment) =>
                payment.user?.name ?? payment.charge?.apartment?.user?.name ?? '-',
        },
        {
            key: 'method',
            label: t('Methode'),
            render: (value) => t(paymentMethodLabels[value] ?? value ?? '-'),
        },
        {
            key: 'payment_proof',
            label: t('Preuve'),
            render: (value) =>
                value ? (
                    <a
                        href={`/storage/${value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-sky-700 underline-offset-4 hover:underline"
                    >
                        {t('Voir')}
                    </a>
                ) : (
                    '-'
                ),
        },
        ...config.indexColumns,
    ];

    const changeBuilding = (event) => {
        const buildingId = event.target.value;

        router.get(
            route(`${config.route}.index`),
            buildingId ? { building_id: buildingId } : {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={payments}
            columns={columns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canEdit={canManagePayments}
            canDelete={canManagePayments}
            filters={
                <select
                    value={selectedBuildingId}
                    onChange={changeBuilding}
                    className="rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">{t('Tous les batiments')}</option>
                    {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                            {building.name}
                        </option>
                    ))}
                </select>
            }
        />
    );
}
