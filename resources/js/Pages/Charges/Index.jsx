import { CrudIndexPage } from '@/Components/CrudScaffold';
import GenerateChargesButton from '@/Components/GenerateChargesButton';
import { useI18n } from '@/i18n/I18nProvider';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { resourceConfigs } from '../_shared/resources';

function chargeStatusLabel(status, t) {
    const labels = {
        paid: t('Payée'),
        pending: t('À régler'),
        overdue: t('En retard'),
    };

    return labels[status] ?? status ?? '-';
}

function ChargePaidSwitch({ charge, canManageCharges, t }) {
    const [processing, setProcessing] = useState(false);
    const isPaid = charge.status === 'paid';
    const label = chargeStatusLabel(charge.status, t);
    const toneClass = isPaid
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : charge.status === 'overdue'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-amber-200 bg-amber-50 text-amber-700';
    const trackClass = isPaid
        ? 'bg-emerald-600'
        : charge.status === 'overdue'
          ? 'bg-rose-500'
          : 'bg-slate-300';

    if (!canManageCharges) {
        return (
            <span
                className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-bold ${toneClass}`}
            >
                {label}
            </span>
        );
    }

    const togglePaid = () => {
        if (processing) {
            return;
        }

        router.patch(
            route('charges.status.update', charge.id),
            { paid: !isPaid },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="flex min-w-[7.75rem] items-center gap-2">
            <button
                type="button"
                role="switch"
                aria-checked={isPaid}
                aria-label={isPaid ? t('Remettre en attente') : t('Marquer comme payée')}
                title={isPaid ? t('Remettre en attente') : t('Marquer comme payée')}
                onClick={togglePaid}
                disabled={processing}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent p-0.5 transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${trackClass}`}
            >
                <span
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition duration-200 ${
                        isPaid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
            <span className={`inline-flex min-w-[4.25rem] justify-center whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-bold ${toneClass}`}>
                {processing ? t('...') : label}
            </span>
        </div>
    );
}

export default function Index({ charges }) {
    const config = resourceConfigs.charges;
    const { auth } = usePage().props;
    const { t } = useI18n();
    const canManageCharges = auth?.user?.role === 'Syndic';
    const canPayCharges = auth?.user?.role === 'Coproprietaire';
    const baseColumns = Object.fromEntries(
        config.indexColumns.map((column) => [column.key, column]),
    );
    const columns = [
        baseColumns.description,
        {
            ...baseColumns.status,
            label: t('Paiement'),
            visibilityClass: '',
            headerClassName: 'w-36',
            cellClassName: 'w-36',
            render: (_, charge) => (
                <ChargePaidSwitch
                    charge={charge}
                    canManageCharges={canManageCharges}
                    t={t}
                />
            ),
        },
        baseColumns.apartment,
        baseColumns.amount,
        baseColumns.date,
    ].filter(Boolean);

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={charges}
            columns={columns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageCharges}
            canEdit={canManageCharges}
            canDelete={canManageCharges}
            toolbarActions={
                canManageCharges ? (
                    <GenerateChargesButton redirectTo="charges.index" />
                ) : null
            }
            rowActions={(charge) => {
                const latestPaymentStatus = charge.latest_payment?.status;

                if (!canPayCharges || charge.status === 'paid' || latestPaymentStatus === 'validated') {
                    return null;
                }

                if (latestPaymentStatus === 'pending') {
                    return (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 sm:px-3 sm:text-xs">
                            {t('En attente')}
                        </span>
                    );
                }

                return (
                    <Link
                        href={route('payments.create', { charge_id: charge.id })}
                        className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700 transition hover:bg-sky-100 sm:px-3 sm:text-xs"
                    >
                        {t('Payer')}
                    </Link>
                );
            }}
        />
    );
}
