import { CrudIndexPage } from '@/Components/CrudScaffold';
import UserAvatar from '@/Components/UserAvatar';
import { useI18n } from '@/i18n/I18nProvider';
import { router, usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

const paymentMethodLabels = {
    virement: 'Virement bancaire',
    cashplus: 'Cash Plus',
    manuel: 'Paiement direct au syndic',
};

function formatMoney(value) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function PaymentUserCell({ payment }) {
    const user = payment.user ?? payment.charge?.apartment?.user ?? null;

    if (!user) {
        return <span>-</span>;
    }

    return (
        <div className="flex min-w-0 items-center gap-2">
            <UserAvatar user={user} size="sm" />
            <span className="min-w-0 truncate font-semibold text-slate-900">
                {user?.name ?? '-'}
            </span>
        </div>
    );
}

function PaymentStatusSwitch({ payment, canManagePayments, t }) {
    const isValidated = payment.status === 'validated';
    const label = isValidated ? t('Validé') : t('En attente');

    if (!canManagePayments) {
        return (
            <span
                className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold ${
                    isValidated
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
            >
                {label}
            </span>
        );
    }

    const nextStatus = isValidated ? 'pending' : 'validated';

    const toggleStatus = () => {
        router.patch(
            route('payments.status.update', payment.id),
            { status: nextStatus },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isValidated}
            title={isValidated ? t('Remettre en attente') : t('Valider le paiement')}
            onClick={toggleStatus}
            className={`inline-flex items-center gap-1.5 rounded-full border px-1.5 py-1 text-[11px] font-bold transition ${
                isValidated
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
        >
            <span
                className={`relative h-4 w-7 rounded-full transition ${
                    isValidated ? 'bg-emerald-600' : 'bg-amber-400'
                }`}
            >
                <span
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition ${
                        isValidated ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                />
            </span>
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

export default function Index({ payments, buildings = [], filters = {} }) {
    const config = resourceConfigs.payments;
    const { auth } = usePage().props;
    const { t } = useI18n();
    const canManagePayments = auth?.user?.role === 'Syndic';
    const selectedBuildingId = filters.building_id ?? '';
    const columns = [
        {
            key: 'user',
            label: t('Utilisateur'),
            render: (_, payment) => <PaymentUserCell payment={payment} />,
        },
        {
            key: 'status',
            label: t('Validation'),
            render: (_, payment) => (
                <PaymentStatusSwitch
                    payment={payment}
                    canManagePayments={canManagePayments}
                    t={t}
                />
            ),
        },
        {
            key: 'amount',
            label: t('Montant'),
            render: (value) => formatMoney(value),
        },
        {
            key: 'apartment',
            label: t('Lot'),
            render: (_, payment) => payment.charge?.apartment?.number ?? '-',
        },
        {
            key: 'payment_date',
            label: t('Date'),
        },
        {
            key: 'method',
            label: t('Méthode'),
            render: (value) => t(paymentMethodLabels[value] ?? value ?? '-'),
        },
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
                    <option value="">{t('Tous les bâtiments')}</option>
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
