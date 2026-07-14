import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const targetTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'building', label: 'Immeuble' },
    { value: 'apartment', label: 'Lot' },
    { value: 'role', label: 'Rôle' },
];

const targetRoles = [
    { value: 'Coproprietaire', label: 'Copropriétaires' },
    { value: 'Locataire', label: 'Locataires' },
];

const categoryTones = {
    pv: 'border-sky-200 bg-sky-50 text-sky-800',
    reglement: 'border-violet-200 bg-violet-50 text-violet-800',
    finance: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    contrat: 'border-amber-200 bg-amber-50 text-amber-800',
    assurance: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    travaux: 'border-rose-200 bg-rose-50 text-rose-800',
    autre: 'border-slate-200 bg-slate-50 text-slate-700',
};

function documentHref(path) {
    if (!path) {
        return '#';
    }

    if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) {
        return path;
    }

    return `/${String(path).replace(/^\/+/, '')}`;
}

function normalizeDocuments(documents) {
    return Array.isArray(documents) ? documents : documents?.data ?? [];
}

function toggleArrayValue(values = [], value) {
    const valueAsString = String(value);
    const currentValues = values.map((item) => String(item));

    if (currentValues.includes(valueAsString)) {
        return values.filter((item) => String(item) !== valueAsString);
    }

    return [...values, value];
}

function EmptyState({ children }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            {children}
        </div>
    );
}

function Field({ id, label, error, children }) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
                {label}
            </label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function DocumentModal({
    open,
    onClose,
    document,
    categoryOptions,
    buildings,
    apartments,
}) {
    const isEditing = Boolean(document);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            title: '',
            category: categoryOptions[0]?.value ?? 'autre',
            file_path: '',
            file: null,
            target_type: 'all',
            building_id: '',
            building_ids: [],
            apartment_id: '',
            target_role: '',
            _method: 'post',
        });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();
        setData({
            title: document?.title ?? '',
            category: document?.category ?? categoryOptions[0]?.value ?? 'autre',
            file_path: document?.file_path ?? '',
            file: null,
            target_type: document?.target_type ?? 'all',
            building_id: document?.building_id ?? '',
            building_ids: document?.building_ids ?? (document?.building_id ? [document.building_id] : []),
            apartment_id: document?.apartment_id ?? '',
            target_role: document?.target_role ?? '',
            _method: isEditing ? 'put' : 'post',
        });
    }, [open, document, isEditing]);

    const close = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();

        post(
            isEditing
                ? route('documents.update', document.id)
                : route('documents.store'),
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: close,
            },
        );
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-3 py-6 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl">
                <div className="border-b border-slate-100 bg-[#0F5132] px-4 py-5 text-white sm:px-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-100/80">
                        Documents
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                        {isEditing ? 'Modifier le document' : 'Ajouter un document'}
                    </h2>
                </div>

                <form onSubmit={submit} className="space-y-5 p-4 sm:p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field id="title" label="Titre" error={errors.title}>
                            <TextInput
                                id="title"
                                className="mt-0 block w-full"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                required
                            />
                        </Field>

                        <Field id="category" label="Catégorie" error={errors.category}>
                            <select
                                id="category"
                                value={data.category}
                                onChange={(event) => setData('category', event.target.value)}
                                className="block min-h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                            >
                                {categoryOptions.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field id="file" label="Fichier" error={errors.file}>
                            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition hover:bg-emerald-50">
                                <span className="text-sm font-semibold text-slate-800">
                                    {data.file?.name ?? 'Choisir un fichier'}
                                </span>
                                <span className="mt-1 text-xs text-slate-500">
                                    PDF, image ou document jusqu'à 10 MB
                                </span>
                                <input
                                    id="file"
                                    type="file"
                                    className="hidden"
                                    onChange={(event) => setData('file', event.target.files?.[0] ?? null)}
                                />
                            </label>
                        </Field>

                        <Field id="file_path" label="Lien ou chemin existant" error={errors.file_path}>
                            <TextInput
                                id="file_path"
                                className="mt-0 block w-full"
                                value={data.file_path}
                                onChange={(event) => setData('file_path', event.target.value)}
                                placeholder="/storage/documents/document.pdf"
                            />
                        </Field>

                        <Field id="target_type" label="Cible" error={errors.target_type}>
                            <select
                                id="target_type"
                                value={data.target_type}
                                onChange={(event) => {
                                    setData({
                                        ...data,
                                        target_type: event.target.value,
                                        building_id: '',
                                        building_ids: [],
                                        apartment_id: '',
                                        target_role: '',
                                    });
                                }}
                                className="block min-h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                            >
                                {targetTypes.map((targetType) => (
                                    <option key={targetType.value} value={targetType.value}>
                                        {targetType.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {data.target_type === 'building' && (
                            <Field id="building_ids" label="Immeubles" error={errors.building_ids || errors.building_id}>
                                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                                    {buildings.map((building) => (
                                        <label
                                            key={building.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-emerald-50"
                                        >
                                            <input
                                                id={`building_ids_${building.id}`}
                                                type="checkbox"
                                                checked={(data.building_ids ?? []).map(String).includes(String(building.id))}
                                                onChange={() => {
                                                    const buildingIds = toggleArrayValue(data.building_ids ?? [], building.id);

                                                    setData({
                                                        ...data,
                                                        building_ids: buildingIds,
                                                        building_id: buildingIds[0] ?? '',
                                                    });
                                                }}
                                                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                                            />
                                            <span>{building.name}</span>
                                        </label>
                                    ))}
                                    {buildings.length === 0 && (
                                        <p className="px-3 py-2 text-sm text-slate-500">
                                            Aucun immeuble disponible.
                                        </p>
                                    )}
                                </div>
                            </Field>
                        )}

                        {data.target_type === 'apartment' && (
                            <Field id="apartment_id" label="Lot" error={errors.apartment_id}>
                                <select
                                    id="apartment_id"
                                    value={data.apartment_id}
                                    onChange={(event) => setData('apartment_id', event.target.value)}
                                    className="block min-h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                >
                                    <option value="">Sélectionner un lot</option>
                                    {apartments.map((apartment) => (
                                        <option key={apartment.id} value={apartment.id}>
                                            {apartment.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        {data.target_type === 'role' && (
                            <Field id="target_role" label="Rôle" error={errors.target_role}>
                                <select
                                    id="target_role"
                                    value={data.target_role}
                                    onChange={(event) => setData('target_role', event.target.value)}
                                    className="block min-h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                >
                                    <option value="">Sélectionner un rôle</option>
                                    {targetRoles.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Enregistrer' : 'Ajouter'}
                        </PrimaryButton>
                        <button
                            type="button"
                            onClick={close}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DocumentActions({ document, canManage, onEdit }) {
    const remove = () => {
        if (!window.confirm('Supprimer ce document ?')) {
            return;
        }

        router.delete(route('documents.destroy', document.id), {
            preserveScroll: true,
        });
    };

    return (
        <details className="relative">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-500 transition hover:bg-emerald-50 hover:text-[#0F5132]">
                ...
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-slate-100 bg-white py-1 shadow-xl">
                <a
                    href={documentHref(document.file_path)}
                    download
                    className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                    Télécharger
                </a>
                {canManage && (
                    <>
                        <button
                            type="button"
                            onClick={onEdit}
                            className="block w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50"
                        >
                            Modifier
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            className="block w-full px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
                        >
                            Supprimer
                        </button>
                    </>
                )}
            </div>
        </details>
    );
}

function DocumentRow({ document, canManage, onEdit }) {
    const fileMeta = [
        document.file_size_label ?? document.file_name,
        document.uploaded_at_label,
    ].filter(Boolean).join(' · ');
    const targetSummary = document.target_summary_label ?? document.target_label;

    return (
        <div className="group grid gap-3 rounded-lg px-3 py-3 transition hover:bg-white md:grid-cols-[1fr_auto] md:items-center">
            <a
                href={documentHref(document.file_path)}
                className="flex min-w-0 items-center gap-3"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold uppercase text-slate-500 group-hover:border-emerald-200 group-hover:text-emerald-800">
                    {document.file_extension ?? 'DOC'}
                </span>
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-950 group-hover:text-[#0F5132]">
                        {document.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{fileMeta || document.file_name}</span>
                        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {targetSummary}
                        </span>
                    </span>
                </span>
            </a>

            <div className="flex items-center justify-between gap-2 md:justify-end">
                <a
                    href={documentHref(document.file_path)}
                    download
                    className="inline-flex min-h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                    Télécharger
                </a>
                <DocumentActions
                    document={document}
                    canManage={canManage}
                    onEdit={onEdit}
                />
            </div>
        </div>
    );
}

function CategorySection({ category, documents, canManage, onEdit }) {
    const tone = categoryTones[category.value] ?? categoryTones.autre;

    return (
        <section className="rounded-lg border border-white/80 bg-white/90 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold ${tone}`}>
                    {category.label.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-950">
                        {category.label}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {documents.length} fichier{documents.length > 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div className="divide-y divide-slate-100 p-2">
                {documents.length > 0 ? (
                    documents.map((document) => (
                        <DocumentRow
                            key={document.id}
                            document={document}
                            canManage={canManage}
                            onEdit={() => onEdit(document)}
                        />
                    ))
                ) : (
                    <div className="px-3 py-5 text-sm text-slate-500">
                        Aucun document dans cette catégorie.
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Index({
    documents = [],
    categoryOptions = [],
    buildings = [],
    apartments = [],
}) {
    const { auth } = usePage().props;
    const canManageDocuments = auth?.user?.role === 'Syndic';
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const rows = normalizeDocuments(documents);
    const categories = categoryOptions.length > 0
        ? categoryOptions
        : [{ value: 'autre', label: 'Autres' }];
    const categoryCounts = useMemo(() => {
        return categories.reduce((counts, category) => ({
            ...counts,
            [category.value]: rows.filter(
                (document) => (document.category ?? 'autre') === category.value,
            ).length,
        }), {});
    }, [categories, rows]);
    const filteredDocuments = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return rows;
        }

        return rows.filter((document) =>
            [
                document.title,
                document.category_label,
                document.target_label,
                document.file_name,
                document.uploaded_by_name,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term)),
        );
    }, [rows, search]);
    const visibleCategories = activeCategory === 'all'
        ? categories
        : categories.filter((category) => category.value === activeCategory);
    const groupedDocuments = visibleCategories
        .map((category) => ({
            ...category,
            documents: filteredDocuments.filter(
                (document) => (document.category ?? 'autre') === category.value,
            ),
        }))
        .filter((category) => activeCategory !== 'all' || !search.trim() || category.documents.length > 0);

    const openCreateModal = () => {
        setEditingDocument(null);
        setModalOpen(true);
    };

    const openEditModal = (document) => {
        setEditingDocument(document);
        setModalOpen(true);
    };

    return (
        <AdminLayout
            title="Documents"
            subtitle="Classement, ciblage et partage des fichiers de la copropriété."
            toolbar={
                canManageDocuments ? (
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center rounded-full bg-[#0F5132] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#146C43]"
                    >
                        Ajouter document
                    </button>
                ) : null
            }
        >
            <Head title="Documents" />

            <div className="mx-auto max-w-7xl space-y-5">
                <section className="rounded-lg bg-[#0F5132] p-5 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:p-6">
                    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-100/80">
                                Bibliothèque
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                                Centre documentaire
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/75">
                                Retrouvez les PV, contrats, règlements, finances et documents ciblés par immeuble, lot ou rôle.
                            </p>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50/70">
                                Total
                            </p>
                            <p className="mt-1 text-3xl font-bold">
                                {rows.length}
                            </p>
                            <p className="mt-1 text-xs text-emerald-50/70">
                                document{rows.length > 1 ? 's' : ''} disponible{rows.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <TextInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Rechercher un document..."
                            className="block min-h-11 w-full pl-4"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${
                            activeCategory === 'all'
                                ? 'border-[#0F5132] bg-[#0F5132] text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                    >
                        Tous
                        <span className="ml-2 opacity-75">{rows.length}</span>
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            type="button"
                            onClick={() => setActiveCategory(category.value)}
                            className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${
                                activeCategory === category.value
                                    ? 'border-[#0F5132] bg-[#0F5132] text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
                            }`}
                        >
                            {category.label}
                            <span className="ml-2 opacity-75">{categoryCounts[category.value] ?? 0}</span>
                        </button>
                    ))}
                </div>

                {groupedDocuments.length > 0 ? (
                    <div className="space-y-4">
                        {groupedDocuments.map((category) => (
                            <CategorySection
                                key={category.value}
                                category={category}
                                documents={category.documents}
                                canManage={canManageDocuments}
                                onEdit={openEditModal}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState>
                        Aucun document ne correspond à votre recherche.
                    </EmptyState>
                )}
            </div>

            <DocumentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                document={editingDocument}
                categoryOptions={categories}
                buildings={buildings}
                apartments={apartments}
            />
        </AdminLayout>
    );
}
