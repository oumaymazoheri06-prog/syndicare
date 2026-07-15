import Modal from "@/Components/Modal";
import { router } from "@inertiajs/react";
import { useState } from "react";

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function buildPayload(month, buildingId) {
    const payload = { month };

    if (buildingId) {
        payload.building_id = buildingId;
    }

    return payload;
}

export default function GenerateChargesButton({
    buildingId = null,
    buildingName = null,
    redirectTo = null,
}) {
    const [showPreview, setShowPreview] = useState(false);
    const [month, setMonth] = useState(currentMonth());
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState("");
    const isBuildingScope = Boolean(buildingId);
    const buttonLabel = isBuildingScope
        ? "Générer les charges de ce bâtiment"
        : "Générer les charges de tous les bâtiments";

    const loadPreview = async (targetMonth = month) => {
        setLoadingPreview(true);
        setError("");

        try {
            const response = await fetch(
                route(
                    "dashboard.charges-preview",
                    buildPayload(targetMonth, buildingId),
                ),
                {
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Impossible de charger l'aperçu.");
            }

            setPreview(await response.json());
        } catch (exception) {
            setPreview(null);
            setError(exception.message);
        } finally {
            setLoadingPreview(false);
        }
    };

    const openPreview = () => {
        setShowPreview(true);
        loadPreview(month);
    };

    const closePreview = () => {
        if (!generating) {
            setShowPreview(false);
        }
    };

    const confirmGénération = () => {
        setGenerating(true);

        router.post(route("dashboard.generate-charges"), {
            ...buildPayload(month, buildingId),
            ...(redirectTo ? { redirect_to: redirectTo } : {}),
        }, {
            preserveScroll: true,
            onSuccess: () => setShowPreview(false),
            onFinish: () => setGenerating(false),
        });
    };

    const totals = preview?.totals;
    const canGenerate = totals && totals.will_create > 0 && !generating;
    const showBuildingDétails = (preview?.buildings?.length || 0) > 1;
    const singleBuildingStatus = !showBuildingDétails
        ? preview?.buildings?.[0]?.status
        : null;

    return (
        <>
            <button
                type="button"
                onClick={openPreview}
                disabled={loadingPreview}
                className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border border-emerald-700 bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loadingPreview ? "Chargement..." : buttonLabel}
            </button>

            <Modal
                show={showPreview}
                onClose={closePreview}
                maxWidth="2xl"
                overlayClassName="bg-slate-100/70 backdrop-blur-sm"
                panelClassName="border border-slate-200 bg-white shadow-2xl shadow-slate-300/40"
            >
                <div className="border-b border-slate-100 bg-white px-5 py-4">
                    <h3 className="text-lg font-semibold text-slate-950">
                        Aperçu de génération des charges
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-md border border-emerald-100 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            {isBuildingScope
                                ? buildingName || "Bâtiment sélectionné"
                                : "Tous les bâtiments"}
                        </span>
                        {singleBuildingStatus && (
                            <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {singleBuildingStatus}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-4 bg-white px-5 py-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div>
                            <label
                                htmlFor="charge-generation-month"
                                className="block text-sm font-semibold text-slate-700"
                            >
                                Mois à générer
                            </label>
                            <input
                                id="charge-generation-month"
                                type="month"
                                value={month}
                                onChange={(event) => {
                                    setMonth(event.target.value);
                                    loadPreview(event.target.value);
                                }}
                                className="mt-2 block w-full rounded-lg border-slate-200 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => loadPreview(month)}
                            disabled={loadingPreview}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            Actualiser
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                            {error}
                        </div>
                    )}

                    {loadingPreview && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            Préparation de l'aperçu...
                        </div>
                    )}

                    {totals && !loadingPreview && (
                        <>
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                        Dépenses du mois
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-slate-950">
                                        {formatCurrency(totals.expenses)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                        Déjà facturé
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-amber-950">
                                        {formatCurrency(totals.existing_amount)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                        Reste à générer
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-emerald-950">
                                        {formatCurrency(totals.total_amount)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex rounded-md border border-emerald-100 bg-emerald-50/70 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                                    {totals.will_create} charges à créer
                                </span>
                                <span className="inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600">
                                    {totals.existing_charges} déjà existantes
                                </span>
                            </div>

                            {showBuildingDétails && (
                                <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
                                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Bâtiment
                                                </th>
                                                <th className="px-4 py-3">
                                                    Dépenses
                                                </th>
                                                <th className="px-4 py-3">
                                                    Déjà facturé
                                                </th>
                                                <th className="px-4 py-3">
                                                    Reste
                                                </th>
                                                <th className="px-4 py-3">
                                                    Statut
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {preview.buildings.map((building) => (
                                                <tr key={building.id}>
                                                    <td className="px-4 py-3 font-medium text-slate-900">
                                                        {building.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatCurrency(
                                                            building.expenses,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatCurrency(
                                                            building.existing_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-emerald-800">
                                                        {formatCurrency(
                                                            building.total_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {building.status}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {totals.will_create === 0 && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                                    Aucune nouvelle charge à générer pour ce mois.
                                    Les montants déjà facturés couvrent les dépenses
                                    actuelles.
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={closePreview}
                        disabled={generating}
                        className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={confirmGénération}
                        disabled={!canGenerate}
                        className="inline-flex justify-center rounded-lg border border-emerald-700 bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {generating ? "Génération..." : "Confirmer la génération"}
                    </button>
                </div>
            </Modal>
        </>
    );
}
