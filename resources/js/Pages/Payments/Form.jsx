import { CrudFormPage } from '@/Components/CrudScaffold';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { useI18n } from '@/i18n/I18nProvider';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { resourceConfigs, asOptions } from '../_shared/resources';

const paymentMethods = [
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cashplus', label: 'Cash Plus' },
    { value: 'manuel', label: 'Paiement direct au syndic' },
];

function formatAmount(value) {
    return Number(value ?? 0).toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function MethodInstructions({ method, paymentInstructions, t }) {
    if (method === 'virement') {
        return (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-slate-700 md:col-span-2">
                <p className="font-semibold text-sky-950">{t('Informations de virement')}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t('RIB')}
                </p>
                <p className="mt-1 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm font-semibold text-slate-900">
                    {paymentInstructions.rib || t('RIB non renseigne par le syndic')}
                </p>
            </div>
        );
    }

    if (method === 'cashplus') {
        return (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-slate-700 md:col-span-2">
                <p className="font-semibold text-amber-950">{t('Informations Cash Plus')}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {t('Nom et prenom')}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {paymentInstructions.cashplus_name || t('Nom du syndic non renseigne')}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {t('Telephone')}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {paymentInstructions.cashplus_phone || t('Telephone du syndic non renseigne')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

function CoOwnerPaymentForm({ charges, paymentDefaults, paymentInstructions = {} }) {
    const { t } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        charge_id: paymentDefaults.charge_id ?? '',
        method: paymentDefaults.method ?? '',
        payment_proof: null,
    });

    const selectedCharge = charges.find(
        (charge) => String(charge.id) === String(data.charge_id),
    );

    const submit = (event) => {
        event.preventDefault();

        post(route('payments.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title={t('Payer une charge')}
            subtitle={t('Envoyez votre preuve au syndic pour validation.')}
            toolbar={
                <Link
                    href={route("charges.index")}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0e3715]"
                >
                    {t('Retour aux charges')}
                </Link>
            }
        >
            <Head title={t('Payer une charge')} />

            <div className="mx-auto max-w-4xl">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                    <form
                        onSubmit={submit}
                        className="space-y-6 p-4 sm:p-6"
                        encType="multipart/form-data"
                    >
                        <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
                            <div>
                                <InputLabel
                                    htmlFor="charge_id"
                                    value={t('Charge a payer')}
                                />
                                <select
                                    id="charge_id"
                                    value={data.charge_id}
                                    onChange={(event) =>
                                        setData("charge_id", event.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    required
                                >
                                    <option value="">
                                        {t('Selectionner une charge')}
                                    </option>
                                    {charges.map((charge) => (
                                        <option
                                            key={charge.id}
                                            value={charge.id}
                                        >
                                            {charge.description} -{" "}
                                            {formatAmount(charge.amount)} {t('MAD')}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.charge_id}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="method"
                                    value={t('Methode de paiement')}
                                />
                                <select
                                    id="method"
                                    value={data.method}
                                    onChange={(event) =>
                                        setData("method", event.target.value)
                                    }
                                    className="mt-1 block w-full rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    required
                                >
                                    <option value="">
                                        {t('Selectionner une methode')}
                                    </option>
                                    {paymentMethods.map((method) => (
                                        <option
                                            key={method.value}
                                            value={method.value}
                                        >
                                            {t(method.label)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.method}
                                    className="mt-2"
                                />
                            </div>

                            <MethodInstructions
                                method={data.method}
                                paymentInstructions={paymentInstructions}
                                t={t}
                            />

                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="payment_proof"
                                    value={t('Preuve de paiement')}
                                />
                                <input
                                    id="payment_proof"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                    onChange={(event) =>
                                        setData(
                                            "payment_proof",
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100 focus:border-emerald-600 focus:ring-emerald-600"
                                    required={data.method !== "manuel"}
                                />
                                <InputError
                                    message={errors.payment_proof}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {selectedCharge && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <p className="text-sm font-semibold text-emerald-950">
                                    {selectedCharge.description}
                                </p>
                                <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                                    <p>
                                        {t('Montant')}:{" "}
                                        {formatAmount(selectedCharge.amount)}{" "}
                                        {t('MAD')}
                                    </p>
                                    <p>
                                        {t('Date')}:{" "}
                                        {selectedCharge.date?.slice(0, 10) ??
                                            "-"}
                                    </p>
                                    <p>
                                        {t('Lot')}:{" "}
                                        {selectedCharge.apartment?.number ??
                                            "-"}
                                    </p>
                                    <p>
                                        {t('Immeuble')}:{" "}
                                        {selectedCharge.apartment?.floor
                                            ?.building?.name ?? "-"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <PrimaryButton disabled={processing}>
                                {t('Envoyer au syndic')}
                            </PrimaryButton>
                            <Link
                                href={route("charges.index")}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition duration-150 ease-in-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:text-xs"
                            >
                                {t('Annuler')}
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}

export default function Form({
    payment,
    charges,
    paymentDefaults = {},
    paymentInstructions = {},
}) {
    const config = resourceConfigs.payments;
    const { auth } = usePage().props;
    const isEditing = Boolean(payment?.id);
    const usesProofFlow = !isEditing && auth?.user?.role === 'Coproprietaire';
    const fields = config.formFields.map((field) =>
        field.name === 'charge_id'
            ? { ...field, options: asOptions(charges, 'id', 'description') }
            : field,
    );
    const defaults = {
        ...config.toFormData(payment),
        ...paymentDefaults,
    };

    if (usesProofFlow) {
        return (
            <CoOwnerPaymentForm
                charges={charges}
                paymentDefaults={paymentDefaults}
                paymentInstructions={paymentInstructions}
            />
        );
    }

    return (
        <CrudFormPage
            title={isEditing ? `Modifier ${config.singular}` : `Creer ${config.singular}`}
            resource={config.route}
            fields={fields}
            defaults={defaults}
            action={
                isEditing
                    ? route(`${config.route}.update`, payment.id)
                    : route(`${config.route}.store`)
            }
            method={isEditing ? 'put' : 'post'}
            submitLabel={isEditing ? `Mettre a jour ${config.singular}` : `Creer ${config.singular}`}
        />
    );
}
