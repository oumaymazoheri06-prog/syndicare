import { CrudIndexPage } from '@/Components/CrudScaffold';
import { useI18n } from '@/i18n/I18nProvider';
import { Link, usePage } from '@inertiajs/react';
import { resourceConfigs } from '../_shared/resources';

export default function Index({ charges }) {
    const config = resourceConfigs.charges;
    const { auth } = usePage().props;
    const { t } = useI18n();
    const canManageCharges = auth?.user?.role === 'Syndic';
    const canPayCharges = auth?.user?.role === 'Coproprietaire';

    return (
        <CrudIndexPage
            title={config.title}
            resource={config.route}
            items={charges}
            columns={config.indexColumns}
            routeKey={config.routeKey}
            createLabel={`Nouveau ${config.singular}`}
            canCreate={canManageCharges}
            canEdit={canManageCharges}
            canDelete={canManageCharges}
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
