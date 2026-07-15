import AdminLayout from '@/Layouts/AdminLayout';
import GenerateChargesButton from '@/Components/GenerateChargesButton';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function formatNumber(value) {
    return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}

function formatArea(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return `${new Intl.NumberFormat('fr-FR', {
        maximumFractionDigits: 2,
    }).format(Number(value))} m2`;
}

function OccupancySwitch({ apartment, residents, onOccupancyChange }) {
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const residentId = apartment.resident?.id ? String(apartment.resident.id) : '';
    const isOccupied = apartment.is_occupied;

    const updateOccupancy = (nextOccupied, nextResidentId = residentId) => {
        if (nextOccupied && !nextResidentId) {
            setFeedback('Choisissez un résident.');
            return;
        }

        const previousResident = apartment.resident;
        const nextResident = nextOccupied
            ? residents.find((resident) => String(resident.id) === String(nextResidentId))
            : null;

        setFeedback('');
        onOccupancyChange(apartment.id, nextResident);

        router.patch(
            route('apartments.occupancy.update', apartment.id),
            {
                is_occupied: nextOccupied,
                user_id: nextOccupied ? nextResidentId : '',
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onError: () => {
                    onOccupancyChange(apartment.id, previousResident);
                    setFeedback('Mise à jour impossible.');
                },
            },
        );
    };

    const handleResidentChange = (event) => {
        const nextResidentId = event.target.value;

        updateOccupancy(Boolean(nextResidentId), nextResidentId);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    role="switch"
                    aria-checked={isOccupied}
                    disabled={processing}
                    onClick={() => updateOccupancy(!isOccupied)}
                    className={`relative inline-flex h-7 w-14 shrink-0 rounded-full border border-transparent transition focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isOccupied ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                >
                    <span
                        className={`inline-block h-7 w-7 rounded-full bg-white shadow transition ${
                            isOccupied ? 'translate-x-7' : 'translate-x-0'
                        }`}
                    />
                </button>
                <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                        isOccupied
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                >
                    {isOccupied ? 'Occupe' : 'Vide'}
                </span>
            </div>

            <select
                value={residentId}
                disabled={processing}
                onChange={handleResidentChange}
                className="min-h-10 w-full rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
            >
                <option value="">Aucun résident</option>
                {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                        {resident.label}
                    </option>
                ))}
            </select>

            {feedback && (
                <p className="text-xs font-medium text-rose-700">
                    {feedback}
                </p>
            )}
        </div>
    );
}

function StatCard({ label, value, helper, tone = 'green' }) {
    const toneClasses = {
        green: 'border-emerald-200 bg-emerald-50/80',
        blue: 'border-sky-200 bg-sky-50/80',
        amber: 'border-amber-200 bg-amber-50/80',
        slate: 'border-slate-200 bg-slate-50/80',
    };
    const accentClasses = {
        green: 'bg-emerald-600',
        blue: 'bg-sky-500',
        amber: 'bg-amber-500',
        slate: 'bg-slate-500',
    };

    return (
        <div
            className={`dashboard-card rounded-lg border p-4 shadow-sm ${
                toneClasses[tone] ?? toneClasses.green
            }`}
        >
            <div
                className={`mb-3 h-1.5 w-20 rounded-full ${
                    accentClasses[tone] ?? accentClasses.green
                }`}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatNumber(value)}
            </p>
            {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
    );
}

function EmptyState({ children }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {children}
        </div>
    );
}

function ApartmentRow({ apartment, residents, onOccupancyChange }) {
    const resident = apartment.resident;

    return (
        <div className="grid gap-3 rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-slate-50 md:grid-cols-[0.75fr_0.65fr_1.25fr_1.3fr] md:items-center">
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Lot
                </p>
                <p className="mt-1 truncate text-base font-semibold text-slate-950">
                    {apartment.number}
                </p>
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Surface
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                    {formatArea(apartment.area)}
                </p>
            </div>

            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Résident
                </p>
                {resident ? (
                    <div className="mt-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                            {resident.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {resident.email}
                        </p>
                    </div>
                ) : (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                        Aucun résident
                    </p>
                )}
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Occupation
                </p>
                <OccupancySwitch
                    apartment={apartment}
                    residents={residents}
                    onOccupancyChange={onOccupancyChange}
                />
            </div>
        </div>
    );
}

function FloorSection({ floor, residents, onOccupancyChange }) {
    const apartments = floor.apartments ?? [];

    return (
        <section className="rounded-lg border border-white/80 bg-white/90 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                        Étage {floor.number}
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {formatNumber(floor.apartments_count)} lots
                    </span>
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        {formatNumber(floor.occupied_apartments_count)} occupés
                    </span>
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {formatNumber(floor.vacant_apartments_count)} vides
                    </span>
                </div>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
                {apartments.length > 0 ? (
                    apartments.map((apartment) => (
                        <ApartmentRow
                            key={apartment.id}
                            apartment={apartment}
                            residents={residents}
                            onOccupancyChange={onOccupancyChange}
                        />
                    ))
                ) : (
                    <EmptyState>Aucun lot dans cet étage.</EmptyState>
                )}
            </div>
        </section>
    );
}

export default function Show({ building, residentOptions = [] }) {
    const [floors, setFloors] = useState(building.floors ?? []);
    const stats = useMemo(() => {
        const apartments = floors.flatMap((floor) => floor.apartments ?? []);
        const apartmentsCount = apartments.length;
        const occupiedCount = apartments.filter((apartment) => apartment.is_occupied).length;

        return {
            floorsCount: floors.length,
            apartmentsCount,
            occupiedCount,
            vacantCount: Math.max(0, apartmentsCount - occupiedCount),
            occupancyRate: apartmentsCount > 0
                ? Math.round((occupiedCount / apartmentsCount) * 100)
                : 0,
        };
    }, [floors]);

    const updateApartmentOccupancy = (apartmentId, resident) => {
        setFloors((currentFloors) =>
            currentFloors.map((floor) => {
                const apartments = (floor.apartments ?? []).map((apartment) => {
                    if (apartment.id !== apartmentId) {
                        return apartment;
                    }

                    return {
                        ...apartment,
                        resident: resident
                            ? {
                                id: resident.id,
                                name: resident.name,
                                email: resident.email,
                                role: resident.role,
                            }
                            : null,
                        is_occupied: Boolean(resident),
                    };
                });
                const occupiedCount = apartments.filter((apartment) => apartment.is_occupied).length;

                return {
                    ...floor,
                    apartments,
                    apartments_count: apartments.length,
                    occupied_apartments_count: occupiedCount,
                    vacant_apartments_count: Math.max(0, apartments.length - occupiedCount),
                };
            }),
        );
    };

    return (
        <AdminLayout
            title={building.name}
            subtitle="Vue détaillée des étages, lots vides et lots occupés."
            toolbar={
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <GenerateChargesButton
                        buildingId={building.id}
                        buildingName={building.name}
                        redirectTo="buildings.show"
                    />
                    <Link
                        href={route('buildings.edit', building.id)}
                        className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
                    >
                        Modifier
                    </Link>
                    <Link
                        href={route('buildings.index')}
                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132]"
                    >
                        Retour à la liste
                    </Link>
                </div>
            }
        >
            <Head title={building.name} />

            <div className="mx-auto max-w-7xl space-y-6">
                <section className="dashboard-card overflow-hidden rounded-lg bg-[#0F5132] text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)]">
                    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-100/80">
                                Fiche immeuble
                            </p>
                            <h2 className="mt-3 break-words text-2xl font-semibold sm:text-3xl">
                                {building.name}
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/75">
                                {building.address}
                            </p>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50/70">
                                        Occupation
                                    </p>
                                    <p className="mt-2 text-3xl font-bold">
                                        {stats.occupancyRate}%
                                    </p>
                                </div>
                                <p className="text-right text-xs leading-5 text-emerald-50/70">
                                    {formatNumber(stats.occupiedCount)}{' '}
                                    occupés sur{' '}
                                    {formatNumber(stats.apartmentsCount)}
                                </p>
                            </div>
                            <div className="mt-4 h-2.5 overflow-hidden rounded-md bg-white/15">
                                <div
                                    className="h-full rounded-md bg-lime-300 transition-all duration-700"
                                    style={{ width: `${stats.occupancyRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Étages"
                        value={stats.floorsCount}
                        helper="Niveaux declares"
                        tone="green"
                    />
                    <StatCard
                        label="Lots"
                        value={stats.apartmentsCount}
                        helper="Appartements total"
                        tone="blue"
                    />
                    <StatCard
                        label="Occupés"
                        value={stats.occupiedCount}
                        helper="Lots avec résident"
                        tone="slate"
                    />
                    <StatCard
                        label="Vides"
                        value={stats.vacantCount}
                        helper="Disponibles pour invitation"
                        tone="amber"
                    />
                </section>

                <section className="rounded-lg border border-white/80 bg-white/90 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur">
                    <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                        <h2 className="text-lg font-semibold text-slate-950">
                            Lots par étage
                        </h2>
                    </div>
                    <div className="space-y-4 p-4 sm:p-5">
                        {floors.length > 0 ? (
                            floors.map((floor) => (
                                <FloorSection
                                    key={floor.id}
                                    floor={floor}
                                    residents={residentOptions}
                                    onOccupancyChange={updateApartmentOccupancy}
                                />
                            ))
                        ) : (
                            <EmptyState>
                                Aucun étage n'est encore associé à cet
                                immeuble.
                            </EmptyState>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
