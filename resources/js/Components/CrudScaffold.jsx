import AdminLayout from '@/Layouts/AdminLayout';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

function normalizeDefaults(fields, defaults = {}) {
    return fields.reduce((carry, field) => {
        const value = defaults[field.name];

        if (field.type === 'checkbox') {
            carry[field.name] = Boolean(value);
        } else if (field.type === 'date') {
            carry[field.name] = value ? String(value).slice(0, 10) : '';
        } else if (value === undefined || value === null) {
            carry[field.name] = '';
        } else {
            carry[field.name] = value;
        }

        return carry;
    }, {});
}

function optionValue(option) {
    if (typeof option === 'object' && option !== null) {
        return option.value;
    }

    return option;
}

function optionLabel(option) {
    if (typeof option === 'object' && option !== null) {
        return option.label ?? option.value;
    }

    return option;
}

function resolveFieldValue(record, field) {
    if (typeof field.render === 'function') {
        return field.render(record[field.name], record);
    }

    return record?.[field.name];
}

function renderInput(field, data, setData, errors) {
    const commonClassName = 'mt-1 block w-full';
    const fieldClassName = 'rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600';

    if (field.type === 'textarea') {
        return (
            <textarea
                className={`${commonClassName} ${fieldClassName}`}
                rows={field.rows ?? 4}
                value={data[field.name]}
                onChange={(event) => setData(field.name, event.target.value)}
                placeholder={field.placeholder}
            />
        );
    }

    if (field.type === 'select') {
        return (
            <select
                className={`${commonClassName} ${fieldClassName}`}
                value={data[field.name]}
                onChange={(event) => setData(field.name, event.target.value)}
            >
                <option value="">Selectionner {field.label}</option>
                {field.options?.map((option) => (
                    <option key={String(optionValue(option))} value={optionValue(option)}>
                        {optionLabel(option)}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="mt-2 flex items-center gap-3">
                <Checkbox
                    checked={Boolean(data[field.name])}
                    onChange={(event) => setData(field.name, event.target.checked)}
                />
                <span className="text-sm text-gray-600">
                    {field.helperText ?? `Activer ${field.label.toLowerCase()}`}
                </span>
            </div>
        );
    }

    return (
        <TextInput
            id={field.name}
            type={field.type ?? 'text'}
            className={commonClassName}
            value={data[field.name]}
            onChange={(event) => setData(field.name, event.target.value)}
            placeholder={field.placeholder}
            step={field.step}
            min={field.min}
            max={field.max}
        />
    );
}

function displayValue(record, field) {
    const value = resolveFieldValue(record, field);

    if (typeof field.format === 'function') {
        return field.format(value, record);
    }

    if (field.type === 'checkbox') {
        return value ? 'Oui' : 'Non';
    }

    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value);
}

function Pagination({ links }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
            {links.map((link, index) => {
                const label = String(link.label)
                    .replace('&laquo;', '<<')
                    .replace('&raquo;', '>>');

                return (
                    <Link
                        key={`${label}-${index}`}
                        href={link.url ?? ''}
                        className={`rounded-md border px-3 py-2 text-sm transition ${
                            link.active
                                ? 'border-[#0e3715] bg-[#0e3715] text-white'
                                : 'border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50'
                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                        preserveScroll
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}

export function CrudIndexPage({
    title,
    resource,
    items,
    columns,
    routeKey = 'id',
    createLabel,
    canCreate = true,
    canView = true,
    canEdit = true,
    canDelete = true,
    filters = null,

}) {
    const rows = Array.isArray(items) ? items : items?.data ?? [];
    const showActions = canView || canEdit || canDelete;
    const toolbar = canCreate ? (
        <Link
            href={route(`${resource}.create`)}
            className="inline-flex items-center justify-center rounded-full bg-[#0e3715] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d]"
        >
            {createLabel ?? `Nouveau ${title.slice(0, -1)}`}
        </Link>
    ) : null;

    return (
        <AdminLayout
            title={title}
            subtitle={`Gestion, consultation et mise a jour des ${title.toLowerCase()}.`}
            toolbar={toolbar}
        >
            <Head title={title} />

            <div className="space-y-5 sm:space-y-6">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 flex items-center justify-between sm:mb-6">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                                        Registres
                                    </h3>
                                    <p className="text-xs text-slate-500 sm:text-sm">
                                        Parcourez, modifiez et suivez les donnees de {title.toLowerCase()}.
                               
                                    </p>
                                </div>
                                {filters && (<div className="flex items-center space-x-2">{filters}</div>)}
                            </div>

                            <div className="overflow-x-auto rounded-[1.5rem] border border-emerald-100 bg-[#fffdf8] shadow-sm">
                                <table className="min-w-[1100px] divide-y divide-emerald-100 xl:min-w-full">
                                    <thead className="bg-[#f7f4ee]">
                                        <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-[#386146] sm:text-xs">
                                            {columns.map((column) => (
                                                <th key={column.key} className="px-4 py-3.5 sm:px-6 sm:py-4">
                                                    {column.label}
                                                </th>
                                            ))}
                                            {showActions && <th className="px-4 py-3.5 sm:px-6 sm:py-4">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50 bg-white/85">
                                        {rows.length > 0 ? (
                                            rows.map((row) => {
                                                const rowKey = row[routeKey] ?? row.id;

                                                return (
                                                    <tr
                                                        key={rowKey}
                                                        className="transition even:bg-[#fbf8f0] hover:bg-emerald-50/70"
                                                    >
                                                        {columns.map((column) => (
                                                            <td
                                                                key={column.key}
                                                                className="whitespace-nowrap px-4 py-4 text-xs text-slate-700 sm:px-6 sm:py-5 sm:text-sm"
                                                            >
                                                                {column.render
                                                                    ? column.render(row[column.key], row)
                                                                : row[column.key] ?? '-'}
                                                            </td>
                                                        ))}
                                                        {showActions && (
                                                            <td className="whitespace-nowrap px-4 py-4 sm:px-6 sm:py-5">
                                                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                                    {canView && (
                                                                        <Link
                                                                            href={route(`${resource}.show`, rowKey)}
                                                                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 sm:px-3 sm:text-xs"
                                                                        >
                                                                            Voir
                                                                        </Link>
                                                                    )}
                                                                    {canEdit && (
                                                                        <Link
                                                                            href={route(`${resource}.edit`, rowKey)}
                                                                            className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 transition hover:bg-emerald-100 sm:px-3 sm:text-xs"
                                                                        >
                                                                            Modifier
                                                                        </Link>
                                                                    )}
                                                                    {canDelete && (
                                                                        <Link
                                                                            href={route(`${resource}.destroy`, rowKey)}
                                                                            method="delete"
                                                                            as="button"
                                                                            onClick={(event) => {
                                                                                if (!window.confirm('Supprimer cet enregistrement ?')) {
                                                                                    event.preventDefault();
                                                                                }
                                                                            }}
                                                                            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 transition hover:bg-rose-100 sm:px-3 sm:text-xs"
                                                                        >
                                                                            Supprimer
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={columns.length + (showActions ? 1 : 0)}
                                                    className="px-4 py-10 text-center text-sm text-slate-500"
                                                >
                                                    Aucun enregistrement trouve.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination links={items?.links} />
                        </div>
                </section>
            </div>
        </AdminLayout>
    );
}

export function CrudFormPage({
    title,
    resource,
    fields,
    defaults,
    action,
    method = 'post',
    submitLabel = 'Enregistrer',
}) {
    const normalizedDefaults = normalizeDefaults(fields, defaults);
    const { data, setData, post, put, patch, processing, errors } = useForm(normalizedDefaults);
    const visibleFields = fields.filter(
        (field) => !field.visibleWhen || field.visibleWhen(data),
    );

    const submit = (event) => {
        event.preventDefault();

        const options = { preserveScroll: true };

        if (method === 'put') {
            put(action, options);
            return;
        }

        if (method === 'patch') {
            patch(action, options);
            return;
        }

        post(action, options);
    };

    return (
        <AdminLayout
            title={title}
            subtitle={method === 'post' ? 'Creation d un nouvel enregistrement.' : 'Modification des informations existantes.'}
            toolbar={
                <Link
                    href={route(`${resource}.index`)}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0e3715]"
                >
                    Retour a la liste
                </Link>
            }
        >
            <Head title={title} />

            <div className="mx-auto max-w-5xl">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                        <form onSubmit={submit} className="space-y-5 p-4 sm:p-6">
                            <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
                                {visibleFields.map((field) => (
                                    <div
                                        key={field.name}
                                        className={field.className ?? field.wrapperClassName ?? ''}
                                    >
                                        {field.type === 'checkbox' ? null : (
                                            <>
                                                <InputLabel htmlFor={field.name} value={field.label} />
                                                {renderInput(field, data, setData, errors)}
                                                <InputError message={errors[field.name]} className="mt-2" />
                                            </>
                                        )}

                                        {field.type === 'checkbox' && (
                                            <>
                                                <InputLabel htmlFor={field.name} value={field.label} />
                                                {renderInput(field, data, setData, errors)}
                                                <InputError message={errors[field.name]} className="mt-2" />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
                                <Link
                                    href={route(`${resource}.index`)}
                                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition duration-150 ease-in-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 sm:text-xs"
                                >
                                    Annuler
                                </Link>
                            </div>
                        </form>
                </section>
            </div>
        </AdminLayout>
    );
}

export function CrudShowPage({
    title,
    resource,
    record,
    fields,
    routeKey = 'id',
    canEdit = true,
    actions = null,
    children = null,
}) {
    return (
        <AdminLayout
            title={title}
            subtitle="Details de l'enregistrement selectionne."
            toolbar={
                <div className="flex flex-wrap gap-2">
                    {actions}
                    {canEdit && (
                        <Link
                            href={route(`${resource}.edit`, record[routeKey] ?? record.id)}
                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
                        >
                            Modifier
                        </Link>
                    )}
                    <Link
                        href={route(`${resource}.index`)}
                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0e3715]"
                    >
                        Retour a la liste
                    </Link>
                </div>
            }
        >
            <Head title={title} />

            <div className="mx-auto max-w-5xl">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                        <div className="grid gap-0 md:grid-cols-2">
                            {fields.map((field, index) => (
                                <div
                                    key={field.name}
                                    className={`border-b border-slate-100 p-4 sm:p-6 ${
                                        index % 2 === 0 ? 'md:border-r' : ''
                                    }`}
                                >
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
                                        {field.label}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-900 sm:text-base">
                                        {displayValue(record, field)}
                                    </p>
                                </div>
                            ))}
                        </div>
                </section>

                {children}
            </div>
        </AdminLayout>
    );
}
