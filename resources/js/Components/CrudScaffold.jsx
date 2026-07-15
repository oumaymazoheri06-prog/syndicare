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
                <option value="">Sélectionner {field.label}</option>
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
                                ? 'border-[#0F5132] bg-[#0F5132] text-white'
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

function columnVisibilityClass(index, column = {}) {
    if (column.visibilityClass !== undefined) {
        return column.visibilityClass;
    }

    if (index < 2) {
        return '';
    }

    if (index < 4) {
        return 'hidden md:table-cell';
    }

    return 'hidden xl:table-cell';
}

function actionToneClass(tone = 'slate') {
    const tones = {
        slate: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        green: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        rose: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    };

    return tones[tone] ?? tones.slate;
}

function ActionIcon({ name }) {
    const icons = {
        view: (
            <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" />
            </>
        ),
        delete: (
            <>
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
            </>
        ),
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
        >
            {icons[name] ?? icons.view}
        </svg>
    );
}

function CellContent({ value }) {
    const title = typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : undefined;
    const className = title
        ? 'min-w-0 overflow-hidden truncate'
        : 'min-w-0 overflow-visible whitespace-nowrap';

    return (
        <div className={className} title={title}>
            {value ?? '-'}
        </div>
    );
}

export function CrudIndexPage({
    title,
    subtitle = null,
    listDescription = null,
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
    rowActions = null,
    toolbarActions = null,
}) {
    const rows = Array.isArray(items) ? items : items?.data ?? [];
    const showActions = canView || canEdit || canDelete || Boolean(rowActions);
    const createButton = canCreate ? (
        <Link
            href={route(`${resource}.create`)}
            className="inline-flex items-center justify-center rounded-full bg-[#0F5132] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#146C43]"
        >
            {createLabel ?? `Nouveau ${title.slice(0, -1)}`}
        </Link>
    ) : null;
    const toolbar = createButton || toolbarActions ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {toolbarActions}
            {createButton}
        </div>
    ) : null;

    return (
        <AdminLayout
            title={title}
            subtitle={subtitle ?? `Gestion, consultation et mise à jour des ${title.toLowerCase()}.`}
            toolbar={toolbar}
        >
            <Head title={title} />

            <div className="space-y-5 sm:space-y-6">
                <section className="overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-[0_14px_34px_rgba(15,23,42,0.07)] backdrop-blur">
                        <div className="p-3 sm:p-4">
                            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                                        Registres
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {listDescription ?? `Parcourez, modifiez et suivez les données de ${title.toLowerCase()}.`}
                               
                                    </p>
                                </div>
                                {filters && (<div className="flex items-center space-x-2">{filters}</div>)}
                            </div>

                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                <table className="w-full table-fixed divide-y divide-emerald-100 text-xs">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[#386146]">
                                            {columns.map((column, index) => (
                                                <th
                                                    key={column.key}
                                                    className={`${columnVisibilityClass(index, column)} ${column.headerClassName ?? ''} px-2.5 py-2.5 font-bold sm:px-3`}
                                                >
                                                    <span className="block truncate">
                                                        {column.label}
                                                    </span>
                                                </th>
                                            ))}
                                            {showActions && (
                                                <th className="w-24 px-2.5 py-2.5 text-right font-bold sm:w-28 sm:px-3">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50 bg-white/85">
                                        {rows.length > 0 ? (
                                            rows.map((row) => {
                                                const rowKey = row[routeKey] ?? row.id;

                                                return (
                                                    <tr
                                                        key={rowKey}
                                                        className="transition even:bg-slate-50/80 hover:bg-emerald-50/70"
                                                    >
                                                        {columns.map((column, index) => {
                                                            const value = column.render
                                                                ? column.render(row[column.key], row)
                                                                : row[column.key] ?? '-';

                                                            return (
                                                            <td
                                                                key={column.key}
                                                                className={`${columnVisibilityClass(index, column)} ${column.cellClassName ?? ''} min-w-0 px-2.5 py-2.5 text-xs text-slate-700 sm:px-3`}
                                                            >
                                                                <CellContent value={value} />
                                                            </td>
                                                            );
                                                        })}
                                                        {showActions && (
                                                            <td className="w-24 px-2.5 py-2.5 sm:w-28 sm:px-3">
                                                                <div className="flex justify-end gap-1">
                                                                    {canView && (
                                                                        <Link
                                                                            href={route(`${resource}.show`, rowKey)}
                                                                            title="Voir"
                                                                            aria-label="Voir"
                                                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${actionToneClass('slate')}`}
                                                                        >
                                                                            <ActionIcon name="view" />
                                                                            <span className="sr-only">Voir</span>
                                                                        </Link>
                                                                    )}
                                                                    {canEdit && (
                                                                        <Link
                                                                            href={route(`${resource}.edit`, rowKey)}
                                                                            title="Modifier"
                                                                            aria-label="Modifier"
                                                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${actionToneClass('green')}`}
                                                                        >
                                                                            <ActionIcon name="edit" />
                                                                            <span className="sr-only">Modifier</span>
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
                                                                            title="Supprimer"
                                                                            aria-label="Supprimer"
                                                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition ${actionToneClass('rose')}`}
                                                                        >
                                                                            <ActionIcon name="delete" />
                                                                            <span className="sr-only">Supprimer</span>
                                                                        </Link>
                                                                    )}
                                                                    {rowActions && rowActions(row)}
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
                                                    Aucun enregistrement trouvé.
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
            subtitle={method === 'post' ? "Création d'un nouvel enregistrement." : 'Modification des informations existantes.'}
            toolbar={
                <Link
                    href={route(`${resource}.index`)}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132]"
                >
                    Retour à la liste
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
            subtitle="Détails de l'enregistrement sélectionné."
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
                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132]"
                    >
                        Retour à la liste
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
