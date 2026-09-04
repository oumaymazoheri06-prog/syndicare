import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";

function formatCurrency(value) {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

function formatCompactCurrency(value) {
    return `${new Intl.NumberFormat("fr-MA", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(Number(value || 0))} MAD`;
}

function formatNumber(value) {
    return new Intl.NumberFormat("fr-FR").format(Number(value || 0));
}

function badgeToneClass(tone = "slate") {
    const tones = {
        slate: "border-slate-200 bg-slate-50 text-slate-700",
        green: "border-emerald-200 bg-emerald-50 text-emerald-800",
        amber: "border-amber-200 bg-amber-50 text-amber-800",
        red: "border-rose-200 bg-rose-50 text-rose-800",
        rose: "border-rose-200 bg-rose-50 text-rose-800",
        blue: "border-sky-200 bg-sky-50 text-sky-800",
        violet: "border-violet-200 bg-violet-50 text-violet-800",
        indigo: "border-indigo-200 bg-indigo-50 text-indigo-800",
        pink: "border-pink-200 bg-pink-50 text-pink-800",
        lime: "border-lime-200 bg-lime-50 text-lime-800",
    };

    return tones[tone] ?? tones.slate;
}

function statusTone(status) {
    if (["paid", "validated", "closed", "ferme"].includes(status)) {
        return "green";
    }

    if (["overdue", "error", "urgent"].includes(status)) {
        return "red";
    }

    if (["pending", "open", "ouvert"].includes(status)) {
        return "amber";
    }

    if (["in_progress", "en_contact"].includes(status)) {
        return "blue";
    }

    return "slate";
}

function statusLabel(status) {
    const labels = {
        paid: "Payée",
        validated: "Validé",
        closed: "Fermé",
        ferme: "Fermé",
        overdue: "En retard",
        pending: "En attente",
        open: "Ouvert",
        ouvert: "Ouvert",
        in_progress: "En cours",
        en_contact: "En contact",
    };

    return labels[status] ?? status ?? "-";
}

function shortText(value, limit = 220) {
    const text = String(value || "");

    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function Badge({ tone = "slate", children }) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${badgeToneClass(tone)}`}
        >
            {children}
        </span>
    );
}

function Panel({ title, subtitle, action, children, className = "" }) {
    return (
        <section
            className={`dashboard-appear dashboard-card rounded-lg border border-white/80 bg-white/90 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur ${className}`}
        >
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-950 sm:text-lg">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action}
            </div>
            <div className="p-4 sm:p-5">{children}</div>
        </section>
    );
}

function metricIconSurfaceClass(tone = "green") {
    const tones = {
        slate: "border-slate-200 bg-slate-100 text-slate-700",
        green: "border-emerald-200 bg-emerald-50 text-emerald-700",
        amber: "border-amber-200 bg-amber-50 text-amber-700",
        red: "border-rose-200 bg-rose-50 text-rose-700",
        rose: "border-rose-200 bg-rose-50 text-rose-700",
        blue: "border-sky-200 bg-sky-50 text-sky-700",
        violet: "border-violet-200 bg-violet-50 text-violet-700",
        lime: "border-lime-200 bg-lime-50 text-lime-700",
    };

    return tones[tone] ?? tones.green;
}

function MetricIcon({ type = "chart" }) {
    const paths = {
        users: (
            <>
                <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M2.5 19a5.5 5.5 0 0 1 11 0" />
                <path d="M16 11a2.5 2.5 0 1 0 0-5" />
                <path d="M17.5 14.5A4.5 4.5 0 0 1 21 19" />
            </>
        ),
        building: (
            <>
                <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                <path d="M16 8h2a2 2 0 0 1 2 2v11" />
                <path d="M8 7h4M8 11h4M8 15h4M9 21v-3h2v3" />
            </>
        ),
        expense: (
            <>
                <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
                <path d="M4 7l2-4h12l2 4" />
                <path d="M9 12h6" />
            </>
        ),
        alert: (
            <>
                <path d="M12 3 2.8 19h18.4L12 3Z" />
                <path d="M12 9v4M12 17h.01" />
            </>
        ),
        charge: (
            <>
                <path d="M7 3h10v18H7z" />
                <path d="M9.5 8h5M9.5 12h5M9.5 16h3" />
            </>
        ),
        rate: (
            <>
                <path d="m5 19 14-14" />
                <path d="M7.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M16.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
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
            className="h-4 w-4"
            aria-hidden="true"
        >
            {paths[type] ?? paths.charge}
        </svg>
    );
}

function MetricCard({ label, value, helper, tone = "green", icon = "chart" }) {
    return (
        <div
            className="dashboard-appear dashboard-card group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold leading-tight text-slate-950 xl:text-base">
                        {value}
                    </p>
                </div>
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition group-hover:scale-105 ${metricIconSurfaceClass(tone)}`}
                >
                    <MetricIcon type={icon} />
                </div>
            </div>
            {helper && (
                <p className="mt-2 truncate text-[11px] font-medium leading-4 text-slate-500">
                    {helper}
                </p>
            )}
        </div>
    );
}

function ProgressBar({ value, tone = "green" }) {
    const tones = {
        green: "bg-emerald-600",
        amber: "bg-amber-500",
        red: "bg-rose-500",
        blue: "bg-sky-500",
        violet: "bg-violet-500",
        slate: "bg-slate-500",
    };
    const width = Math.min(100, Math.max(0, Number(value || 0)));

    return (
        <div className="h-2.5 overflow-hidden rounded-md bg-slate-100">
            <div
                className={`h-full rounded-md transition-all duration-700 ease-out ${tones[tone] ?? tones.green}`}
                style={{ width: `${width}%` }}
            />
        </div>
    );
}

function EmptyState({ children = "Aucune donnée pour le moment." }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {children}
        </div>
    );
}

function LineChart({ data = [] }) {
    const width = 720;
    const height = 260;
    const padding = 30;
    const series = [
        { key: "expenses", color: "#0f766e", label: "Dépenses" },
        { key: "charges", color: "#146C43", label: "Charges" },
        { key: "payments", color: "#b45309", label: "Paiements" },
    ];

    if (!data.length) {
        return <EmptyState>Aucune évolution mensuelle disponible.</EmptyState>;
    }

    const max = Math.max(
        1,
        ...data.flatMap((item) =>
            series.map(({ key }) => Number(item[key] || 0)),
        ),
    );
    const xStep =
        data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

    const pointsFor = (key) =>
        data
            .map((item, index) => {
                const x = padding + index * xStep;
                const y =
                    height -
                    padding -
                    (Number(item[key] || 0) / max) * (height - padding * 2);

                return `${x},${y}`;
            })
            .join(" ");

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-2">
                {series.map((item) => (
                    <Badge
                        key={item.key}
                        tone={
                            item.key === "expenses"
                                ? "green"
                                : item.key === "charges"
                                  ? "blue"
                                  : "amber"
                        }
                    >
                        {item.label}
                    </Badge>
                ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-[220px] w-full sm:h-[260px]"
                >
                    {[0, 1, 2, 3].map((index) => {
                        const y =
                            padding + ((height - padding * 2) / 3) * index;

                        return (
                            <line
                                key={index}
                                x1={padding}
                                x2={width - padding}
                                y1={y}
                                y2={y}
                                stroke="#d6d3ce"
                                strokeDasharray="5 7"
                            />
                        );
                    })}

                    {series.map(({ key, color }) => (
                        <polyline
                            key={key}
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={pointsFor(key)}
                        />
                    ))}

                    {data.map((item, index) => (
                        <text
                            key={item.label}
                            x={padding + index * xStep}
                            y={height - 6}
                            textAnchor="middle"
                            className="fill-slate-500 text-[12px]"
                        >
                            {item.label}
                        </text>
                    ))}
                </svg>
            </div>
        </div>
    );
}

function RevenueChart({ series = {} }) {
    const [period, setPeriod] = useState("month");
    const options = [
        { key: "day", label: "Jour" },
        { key: "month", label: "Mois" },
        { key: "year", label: "Année" },
    ];
    const data = Array.isArray(series?.[period]) ? series[period] : [];
    const values = data.map((item) => Number(item.value || 0));
    const total = data.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0,
    );
    const maxValue = Math.max(1, ...values);
    const yMax = Math.ceil(maxValue / 100) * 100 || 1;
    const width = 640;
    const height = 300;
    const padding = {
        top: 24,
        right: 28,
        bottom: 44,
        left: 76,
    };
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = width - padding.left - padding.right;
    const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;
    const labelStep = Math.max(1, Math.ceil(data.length / 5));
    const activeLabel =
        options.find((option) => option.key === period)?.label || "Mois";
    const points = data.map((item, index) => {
        const x =
            data.length > 1
                ? padding.left + index * xStep
                : padding.left + chartWidth / 2;
        const y =
            padding.top +
            (1 - Number(item.value || 0) / yMax) * chartHeight;

        return { ...item, x, y, value: Number(item.value || 0) };
    });
    const linePath = points.reduce((path, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }

        const previous = points[index - 1];
        const controlX = (previous.x + point.x) / 2;

        return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    }, "");
    const areaPath =
        points.length > 1
            ? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
            : "";
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const value = yMax * ratio;
        const y = padding.top + (1 - ratio) * chartHeight;

        return { value, y };
    });

    return (
        <Panel
            title="Aperçu des revenus"
            subtitle="Courbe des paiements validés selon la période choisie."
            className="h-full"
            action={
                <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                    {options.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => setPeriod(option.key)}
                            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                                period === option.key
                                    ? "bg-emerald-700 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            }
        >
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Total {activeLabel.toLowerCase()}
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                        {formatCurrency(total)}
                    </p>
                </div>
                <p className="text-sm text-slate-500">
                    {data.length} points affichés
                </p>
            </div>

            {data.length ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="h-[260px] w-full sm:h-[300px]"
                        role="img"
                        aria-label="Courbe des revenus validés"
                    >
                        <defs>
                            <linearGradient
                                id="revenueAreaGradient"
                                x1="0"
                                x2="0"
                                y1="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#059669"
                                    stopOpacity="0.22"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#059669"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>

                        {yTicks.map((tick) => (
                            <g key={tick.value}>
                                <line
                                    x1={padding.left}
                                    x2={width - padding.right}
                                    y1={tick.y}
                                    y2={tick.y}
                                    stroke="#e2e8f0"
                                    strokeDasharray="4 7"
                                />
                                <text
                                    x={padding.left - 12}
                                    y={tick.y + 4}
                                    textAnchor="end"
                                    className="fill-slate-500 text-[11px]"
                                >
                                    {formatCompactCurrency(tick.value)}
                                </text>
                            </g>
                        ))}

                        <line
                            x1={padding.left}
                            x2={padding.left}
                            y1={padding.top}
                            y2={height - padding.bottom}
                            stroke="#cbd5e1"
                        />
                        <line
                            x1={padding.left}
                            x2={width - padding.right}
                            y1={height - padding.bottom}
                            y2={height - padding.bottom}
                            stroke="#cbd5e1"
                        />

                        {areaPath && (
                            <path
                                d={areaPath}
                                fill="url(#revenueAreaGradient)"
                            />
                        )}
                        {linePath && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#047857"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {points.map((point, index) => (
                            <g key={`${point.label}-${index}`}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="5"
                                    className="fill-white stroke-emerald-700"
                                    strokeWidth="3"
                                >
                                    <title>
                                        {point.label} -{" "}
                                        {formatCurrency(point.value)}
                                    </title>
                                </circle>
                                {point.value > 0 &&
                                    (data.length <= 8 ||
                                        index === points.length - 1 ||
                                        point.value === maxValue) && (
                                    <text
                                        x={point.x}
                                        y={Math.max(14, point.y - 12)}
                                        textAnchor="middle"
                                        className="fill-emerald-800 text-[11px] font-semibold"
                                    >
                                        {formatCompactCurrency(point.value)}
                                    </text>
                                )}
                                {index % labelStep === 0 && (
                                    <text
                                        x={point.x}
                                        y={height - 12}
                                        textAnchor="middle"
                                        className="fill-slate-500 text-[11px]"
                                    >
                                        {point.label}
                                    </text>
                                )}
                            </g>
                        ))}
                    </svg>
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="h-2 w-6 rounded-full bg-emerald-700" />
                        Paiements validés
                    </div>
                </div>
            ) : (
                <EmptyState>Aucun revenu validé pour cette période.</EmptyState>
            )}
        </Panel>
    );
}

function StatusRows({ rows = [] }) {
    const total = Math.max(
        1,
        rows.reduce((sum, item) => sum + Number(item.value || 0), 0),
    );

    return (
        <div className="space-y-4">
            {rows.map((item) => {
                const percent = (Number(item.value || 0) / total) * 100;

                return (
                    <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-slate-700">
                                {item.label}
                            </span>
                            <span className="text-slate-500">
                                {formatNumber(item.value)}
                            </span>
                        </div>
                        <ProgressBar value={percent} tone={item.tone} />
                    </div>
                );
            })}
        </div>
    );
}

function CompactList({ items, empty, children }) {
    if (!items?.length) {
        return <EmptyState>{empty}</EmptyState>;
    }

    return <div className="dashboard-list space-y-3">{items.map(children)}</div>;
}

function RecentTicketsPanel({ tickets = [] }) {
    const visibleTickets = tickets.slice(0, 3);

    return (
        <Panel
            title="Derniers tickets"
            subtitle="Les demandes les plus récentes avec le résident et le problème."
            className="h-full"
            action={
                <Link
                    href={route("tickets.index")}
                    className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                >
                    Voir tickets
                </Link>
            }
        >
            <CompactList items={visibleTickets} empty="Aucun ticket récent.">
                {(ticket) => (
                    <div
                        key={ticket.id}
                        className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    {ticket.created_by || "Résident"}
                                </p>
                                <p className="mt-1 font-semibold text-slate-950">
                                    {ticket.title || "Ticket"}
                                </p>
                            </div>
                            <Badge tone={statusTone(ticket.status)}>
                                {statusLabel(ticket.status)}
                            </Badge>
                        </div>
                        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                            {shortText(
                                ticket.description ||
                                    "Aucune description renseignée.",
                                180,
                            )}
                        </p>
                        <p className="mt-3 text-xs font-medium text-slate-500">
                            {ticket.building || "-"} - Appartement{" "}
                            {ticket.apartment || "-"} -{" "}
                            {ticket.created_at || "-"}
                        </p>
                    </div>
                )}
            </CompactList>
        </Panel>
    );
}

function UnpaidChargesPanel({ charges = [] }) {
    const visibleCharges = charges.slice(0, 3);

    return (
        <Panel
            title="Charges impayées"
            subtitle="Charges en attente ou en retard à suivre."
            className="h-full"
            action={
                <Link
                    href={route("charges.index")}
                    className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-100"
                >
                    Voir charges
                </Link>
            }
        >
            <CompactList items={visibleCharges} empty="Aucune charge impayée.">
                {(charge) => (
                    <div
                        key={charge.id}
                        className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-950">
                                    {charge.description || "Charge"}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {charge.resident || "Résident non associé"}{" "}
                                    - Appartement {charge.apartment || "-"}
                                </p>
                            </div>
                            <Badge tone={statusTone(charge.status)}>
                                {statusLabel(charge.status)}
                            </Badge>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-3">
                            <p className="text-xs font-medium text-slate-500">
                                {charge.building || "-"}
                            </p>
                            <p className="text-lg font-bold text-rose-700">
                                {formatCurrency(charge.amount)}
                            </p>
                        </div>
                    </div>
                )}
            </CompactList>
        </Panel>
    );
}

function AnnouncementsPanel({
    announcements = [],
    isBuildingView = false,
    buildingName = "",
}) {
    const visibleAnnouncements = announcements.slice(0, 3);
    const subtitle = isBuildingView
        ? `Annonces globales et annonces de ${buildingName || "l'immeuble sélectionné"}.`
        : "Annonces globales destinées à tous les immeubles.";

    return (
        <Panel
            title="Mur des annonces"
            subtitle={subtitle}
            className="h-full"
            action={
                <Link
                    href={route("announcements.index")}
                    className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                    Voir annonces
                </Link>
            }
        >
            {visibleAnnouncements.length ? (
                <div className="grid gap-4">
                    {visibleAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="break-words font-semibold text-slate-950">
                                        {announcement.title}
                                    </p>
                                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                                        {shortText(announcement.content, 220)}
                                    </p>
                                </div>
                                <Badge tone="green">
                                    {announcement.building}
                                </Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                <span>{announcement.creator || "Syndic"}</span>
                                <span>-</span>
                                <span>{announcement.created_at || "-"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState>Aucune annonce publiée.</EmptyState>
            )}
        </Panel>
    );
}

function documentHref(path) {
    if (!path) {
        return null;
    }

    if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) {
        return path;
    }

    return `/${String(path).replace(/^\/+/, "")}`;
}

function firstName(user) {
    return user?.name?.split(" ")?.[0] || "Bienvenue";
}

function IncidentForm({ apartments = [] }) {
    const defaultApartmentId = apartments?.[0]?.id
        ? String(apartments[0].id)
        : "";
    const { data, setData, post, processing, errors, reset, recentlySuccessful } =
        useForm({
            title: "",
            description: "",
            apartment_id: defaultApartmentId,
            assigned_to: "",
            status: "open",
        });

    const submit = (event) => {
        event.preventDefault();

        post(route("tickets.store"), {
            preserveScroll: true,
            onSuccess: () => reset("title", "description"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label
                    htmlFor="incident-title"
                    className="text-sm font-semibold text-slate-700"
                >
                    Sujet
                </label>
                <input
                    id="incident-title"
                    type="text"
                    value={data.title}
                    onChange={(event) => setData("title", event.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                {errors.title && (
                    <p className="mt-1.5 text-xs font-medium text-rose-700">
                        {errors.title}
                    </p>
                )}
            </div>

            {apartments.length > 0 && (
                <div>
                    <label
                        htmlFor="incident-apartment"
                        className="text-sm font-semibold text-slate-700"
                    >
                        Lot concerné
                    </label>
                    <select
                        id="incident-apartment"
                        value={data.apartment_id}
                        onChange={(event) =>
                            setData("apartment_id", event.target.value)
                        }
                        className="mt-1.5 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">Non précisé</option>
                        {apartments.map((apartment) => (
                            <option key={apartment.id} value={apartment.id}>
                                {apartment.building || "Immeuble"} -{" "}
                                {apartment.number}
                            </option>
                        ))}
                    </select>
                    {errors.apartment_id && (
                        <p className="mt-1.5 text-xs font-medium text-rose-700">
                            {errors.apartment_id}
                        </p>
                    )}
                </div>
            )}

            <div>
                <label
                    htmlFor="incident-description"
                    className="text-sm font-semibold text-slate-700"
                >
                    Détails
                </label>
                <textarea
                    id="incident-description"
                    rows={5}
                    value={data.description}
                    onChange={(event) =>
                        setData("description", event.target.value)
                    }
                    className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                {errors.description && (
                    <p className="mt-1.5 text-xs font-medium text-rose-700">
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0F5132] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#146C43] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? "Envoi..." : "Soumettre"}
                </button>
                {recentlySuccessful && (
                    <span className="text-sm font-semibold text-emerald-700">
                        Réclamation envoyée.
                    </span>
                )}
            </div>
        </form>
    );
}

function RoleHero({ badge, title, description, children }) {
    return (
        <section className="dashboard-appear dashboard-card rounded-lg bg-[#0F5132] p-4 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:p-6 lg:p-7">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
                <div>
                    <div className="mb-4 flex flex-wrap gap-2">
                        <Badge tone="green">{badge}</Badge>
                        <Badge tone="blue">
                            {new Intl.DateTimeFormat("fr-FR", {
                                month: "long",
                                year: "numeric",
                            }).format(new Date())}
                        </Badge>
                    </div>
                    <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                        {title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/80">
                        {description}
                    </p>
                </div>
                {children}
            </div>
        </section>
    );
}

function OwnerLineChart({ data = [] }) {
    const width = 720;
    const height = 240;
    const padding = 30;
    const series = [
        { key: "charges", color: "#C9A227", label: "Appels de fonds" },
        { key: "payments", color: "#0f766e", label: "Paiements" },
    ];

    if (!data.length) {
        return <EmptyState>Aucune évolution personnelle disponible.</EmptyState>;
    }

    const max = Math.max(
        1,
        ...data.flatMap((item) =>
            series.map(({ key }) => Number(item[key] || 0)),
        ),
    );
    const xStep =
        data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
    const pointsFor = (key) =>
        data
            .map((item, index) => {
                const x = padding + index * xStep;
                const y =
                    height -
                    padding -
                    (Number(item[key] || 0) / max) * (height - padding * 2);

                return `${x},${y}`;
            })
            .join(" ");

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-2">
                <Badge tone="amber">Appels de fonds</Badge>
                <Badge tone="green">Paiements</Badge>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-[220px] w-full"
                >
                    {[0, 1, 2, 3].map((index) => {
                        const y =
                            padding + ((height - padding * 2) / 3) * index;

                        return (
                            <line
                                key={index}
                                x1={padding}
                                x2={width - padding}
                                y1={y}
                                y2={y}
                                stroke="#d6d3ce"
                                strokeDasharray="5 7"
                            />
                        );
                    })}

                    {series.map(({ key, color }) => (
                        <polyline
                            key={key}
                            fill="none"
                            stroke={color}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={pointsFor(key)}
                        />
                    ))}

                    {data.map((item, index) => (
                        <text
                            key={item.label}
                            x={padding + index * xStep}
                            y={height - 6}
                            textAnchor="middle"
                            className="fill-slate-500 text-[12px]"
                        >
                            {item.label}
                        </text>
                    ))}
                </svg>
            </div>
        </div>
    );
}

function AnnouncementCard({ announcement }) {
    return (
        <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-950">
                    {announcement.title}
                </p>
                <Badge tone="blue">{announcement.target_role}</Badge>
            </div>
            {announcement.content && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {announcement.content}
                </p>
            )}
            <p className="mt-3 text-sm text-slate-500">
                {announcement.building} - {announcement.created_at || "-"}
            </p>
        </div>
    );
}

function TicketCard({ ticket }) {
    return (
        <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-950">{ticket.title}</p>
                <Badge tone={statusTone(ticket.status)}>
                    {statusLabel(ticket.status)}
                </Badge>
            </div>
            {ticket.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {ticket.description}
                </p>
            )}
            <p className="mt-3 text-sm text-slate-500">
                {ticket.building || "-"} - {ticket.apartment || "-"} -{" "}
                {ticket.created_at || "-"}
            </p>
        </div>
    );
}

function CoOwnerDashboard({ auth = {}, data = {} }) {
    const summary = data.summary || {};
    const apartments = data.apartments || [];
    const charges = data.charges || [];
    const payments = data.payments || [];
    const tickets = data.tickets || [];
    const announcements = data.announcements || [];
    const documents = data.documents || [];
    const monthlySeries = data.monthlySeries || [];
    const balanceDue = Number(summary.balance || 0) > 0;
    const financeCards = [
        {
            label: "Solde à régulariser",
            value: formatCurrency(summary.balance),
            helper: "Charges en attente ou en retard",
            className: balanceDue
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900",
        },
        {
            label: "Appels du mois",
            value: formatCurrency(summary.monthlyCharges),
            helper: "Montant appelé ce mois",
            className: "border-sky-200 bg-sky-50 text-sky-900",
        },
        {
            label: "Paiements validés",
            value: formatCurrency(summary.validatedPayments),
            helper: "Historique personnel",
            className: "border-emerald-200 bg-emerald-50 text-emerald-900",
        },
        {
            label: "Documents",
            value: formatNumber(summary.documents),
            helper: "PV d'AG et fichiers",
            className: "border-slate-200 bg-slate-50 text-slate-800",
        },
    ];

    return (
        <AdminLayout
            title="Tableau de bord copropriétaire"
            subtitle="Solde personnel, appels de fonds, PV d'AG et incidents."
        >
            <Head title="Tableau de bord copropriétaire" />

            <div className="space-y-5 sm:space-y-6">
                <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] xl:items-stretch">
                    <div className="dashboard-appear dashboard-card rounded-lg bg-[#0F5132] p-4 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:p-5">
                        <div className="flex flex-wrap gap-2">
                            <Badge tone="green">Copropriétaire</Badge>
                            <Badge tone={balanceDue ? "amber" : "green"}>
                                {balanceDue ? "À régulariser" : "À jour"}
                            </Badge>
                        </div>
                        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                            <div>
                                <h2 className="text-2xl font-semibold sm:text-3xl">
                                    Bonjour {firstName(auth.user)}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80">
                                    Suivez vos lots, vos appels de fonds, vos
                                    paiements et les communications du syndic
                                    depuis une seule vue.
                                </p>
                            </div>
                            <div className="grid min-w-[220px] grid-cols-3 gap-2 rounded-lg border border-white/15 bg-white/10 p-2">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase text-emerald-100/70">
                                        Lots
                                    </p>
                                    <p className="mt-1 text-lg font-bold">
                                        {formatNumber(summary.lots)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase text-emerald-100/70">
                                        Bâtiments
                                    </p>
                                    <p className="mt-1 text-lg font-bold">
                                        {formatNumber(summary.buildings)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase text-emerald-100/70">
                                        Tickets
                                    </p>
                                    <p className="mt-1 text-lg font-bold">
                                        {formatNumber(summary.openTickets)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link
                                href={route("payments.create")}
                                className="inline-flex min-h-10 items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                            >
                                Régler une charge
                            </Link>
                            <Link
                                href={route("tickets.create")}
                                className="inline-flex min-h-10 items-center rounded-md border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Déclarer un incident
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {financeCards.map((card) => (
                            <div
                                key={card.label}
                                className={`dashboard-appear dashboard-card rounded-lg border p-3 shadow-sm ${card.className}`}
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-75">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-xl font-bold leading-tight">
                                    {card.value}
                                </p>
                                <p className="mt-1 text-xs font-medium opacity-75">
                                    {card.helper}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
                    <Panel
                        title="Mes lots"
                        subtitle="Situation par appartement détenu."
                    >
                        <CompactList
                            items={apartments}
                            empty="Aucun lot rattaché à votre compte."
                        >
                            {(apartment) => (
                                <div
                                    key={apartment.id}
                                    className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-950">
                                                Lot {apartment.number}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {apartment.building || "-"} -
                                                Étage {apartment.floor || "-"}
                                            </p>
                                        </div>
                                        <Badge
                                            tone={
                                                apartment.balance > 0
                                                    ? "amber"
                                                    : "green"
                                            }
                                        >
                                            {statusLabel(apartment.status)}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-500">
                                                Surface
                                            </p>
                                            <p className="truncate text-sm font-semibold text-slate-950">
                                                {formatNumber(apartment.area)}{" "}
                                                m²
                                            </p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-500">
                                                Solde
                                            </p>
                                            <p className="truncate text-sm font-semibold text-slate-950">
                                                {formatCurrency(
                                                    apartment.balance,
                                                )}
                                            </p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-500">
                                                Incidents
                                            </p>
                                            <p className="truncate text-sm font-semibold text-slate-950">
                                                {formatNumber(
                                                    apartment.open_tickets,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Déclarer un incident"
                        subtitle="Maintenance, panne ou anomalie technique."
                    >
                        <IncidentForm apartments={apartments} />
                    </Panel>
                </section>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
                    <Panel
                        title="Appels de fonds"
                        subtitle="Charges rattachées à vos lots."
                    >
                        <CompactList
                            items={charges.slice(0, 3)}
                            empty="Aucun appel de fonds trouvé."
                        >
                            {(charge) => (
                                <div
                                    key={charge.id}
                                    className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-950">
                                                {charge.description}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {charge.building || "-"} - Lot{" "}
                                                {charge.apartment || "-"} -{" "}
                                                {charge.date || "-"}
                                            </p>
                                        </div>
                                        <Badge tone={statusTone(charge.status)}>
                                            {statusLabel(charge.status)}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                                        <p className="text-sm font-medium text-slate-500">
                                            Montant
                                        </p>
                                        <p className="text-base font-bold text-slate-950">
                                            {formatCurrency(charge.amount)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <div className="space-y-6">
                        <Panel
                            title="Évolution personnelle"
                            subtitle="Appels de fonds et paiements validés."
                        >
                            <OwnerLineChart data={monthlySeries} />
                        </Panel>

                        {/* <Panel
                            title="Paiements"
                            subtitle="Dernières opérations enregistrées."
                        >
                            <CompactList
                                items={payments.slice(0, 3)}
                                empty="Aucun paiement trouvé."
                            >
                                {(payment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-lg border border-slate-100 bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {payment.charge || "Charge"}{" "}
                                                    - {payment.payment_date}
                                                </p>
                                            </div>
                                            <Badge
                                                tone={statusTone(
                                                    payment.status,
                                                )}
                                            >
                                                {statusLabel(payment.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </CompactList>
                        </Panel> */}
                    </div>
                </section>

                <section className="grid gap-5 xl:grid-cols-3 xl:items-start">
                    {/* <Panel
                        title="PV d'AG et documents"
                        subtitle="Fichiers disponibles au téléchargement."
                    >
                        <CompactList
                            items={documents}
                            empty="Aucun document disponible."
                        >
                            {(document) => (
                                <div
                                    key={document.id}
                                    className="rounded-lg border border-slate-100 bg-white p-4"
                                >
                                    <p className="font-semibold text-slate-950">
                                        {document.title}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {document.uploader || "Syndic"} -{" "}
                                        {document.created_at || "-"}
                                    </p>
                                    {document.file_path && (
                                        <a
                                            href={documentHref(
                                                document.file_path,
                                            )}
                                            className="mt-3 inline-flex rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Télécharger
                                        </a>
                                    )}
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Annonces récentes"
                        subtitle="Communications liées à vos immeubles."
                    >
                        <CompactList
                            items={announcements}
                            empty="Aucune annonce récente."
                        >
                            {(announcement) => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    announcement={announcement}
                                />
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Mes incidents"
                        subtitle="Suivi de vos déclarations techniques."
                    >
                        <CompactList
                            items={tickets}
                            empty="Aucun incident déclaré."
                        >
                            {(ticket) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            )}
                        </CompactList>
                    </Panel> */}
                </section>
            </div>
        </AdminLayout>
    );
}

function TenantDashboard({ auth = {}, data = {} }) {
    const summary = data.summary || {};
    const apartments = data.apartments || [];
    const announcements = data.announcements || [];
    const tickets = data.tickets || [];

    return (
        <AdminLayout
            title="Tableau de bord locataire"
            subtitle="Mur d'annonces et réclamations techniques."
        >
            <Head title="Tableau de bord locataire" />

            <div className="space-y-5 sm:space-y-6">
                <RoleHero
                    badge="Locataire"
                    title={`Bonjour ${firstName(auth.user)}`}
                    description="Accès restreint aux communications de l'immeuble et au suivi des réclamations techniques."
                >
                    <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-emerald-300/30 bg-emerald-900/35 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase text-emerald-100/70">
                                Annonces
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                                {formatNumber(summary.announcements)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-sky-300/30 bg-sky-900/25 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase text-sky-100/75">
                                Ouvertes
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                                {formatNumber(summary.openTickets)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-lime-300/30 bg-lime-900/25 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase text-lime-100/75">
                                Clôturées
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                                {formatNumber(summary.closedTickets)}
                            </p>
                        </div>
                    </div>
                </RoleHero>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Appartement"
                        value={formatNumber(summary.apartments)}
                        helper="Logement rattaché au compte"
                        tone="green"
                    />
                    <MetricCard
                        label="Annonces"
                        value={formatNumber(summary.announcements)}
                        helper="Mur d'informations"
                        tone="blue"
                    />
                    <MetricCard
                        label="Reclamations ouvertes"
                        value={formatNumber(summary.openTickets)}
                        helper="Demandes techniques en cours"
                        tone="amber"
                    />
                    <MetricCard
                        label="Réclamations traitées"
                        value={formatNumber(summary.closedTickets)}
                        helper="Historique clôturé"
                        tone="green"
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
                    <Panel
                        title="Mur d'annonces"
                        subtitle="Informations partagées avec les résidents."
                    >
                        <CompactList
                            items={announcements}
                            empty="Aucune annonce disponible."
                        >
                            {(announcement) => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    announcement={announcement}
                                />
                            )}
                        </CompactList>
                    </Panel>

                    <div className="space-y-6">
                        <Panel
                            title="Nouvelle réclamation"
                            subtitle="Déclaration technique uniquement."
                        >
                            <IncidentForm apartments={apartments} />
                        </Panel>

                        {/* <Panel
                            title="Appartement occupé"
                            subtitle="Logement associé à votre compte."
                        >
                            <CompactList
                                items={apartments}
                                empty="Aucun appartement rattaché."
                            >
                                {(apartment) => (
                                    <div
                                        key={apartment.id}
                                        className="rounded-lg border border-slate-100 bg-white p-4"
                                    >
                                        <p className="font-semibold text-slate-950">
                                            Appartement {apartment.number}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {apartment.building || "-"} - Étage{" "}
                                            {apartment.floor || "-"}
                                        </p>
                                    </div>
                                )}
                            </CompactList>
                        </Panel> */}
                    </div>
                </section>

                <Panel
                    title="Mes réclamations techniques"
                    subtitle="État des demandes envoyées au syndic."
                >
                    <CompactList
                        items={tickets}
                        empty="Aucune réclamation technique envoyée."
                    >
                        {(ticket) => <TicketCard key={ticket.id} ticket={ticket} />}
                    </CompactList>
                </Panel>
            </div>
        </AdminLayout>
    );
}

export default function Dashboard({
    auth = {},
    roleDashboard = null,
    isGlobal = true,
    summary = {},
    revenueSeries = {},
    buildings = [],
    recentTickets = [],
    recentAnnouncements = [],
    unpaidCharges = [],
    health = {},
}) {
    if (roleDashboard?.role === "Coproprietaire") {
        return <CoOwnerDashboard auth={auth} data={roleDashboard} />;
    }

    if (roleDashboard?.role === "Locataire") {
        return <TenantDashboard auth={auth} data={roleDashboard} />;
    }

    const params =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();
    const selectedBuildingId = params.get("building_id") || "";
    const selectedBuilding = buildings.find(
        (building) => String(building.id) === String(selectedBuildingId),
    );
    const isBuildingView = Boolean(selectedBuildingId);
    const changeBuilding = (buildingId) => {
        window.location.href = buildingId
            ? `/dashboard?building_id=${buildingId}`
            : "/dashboard";
    };

    return (
        <AdminLayout
            title="Tableau de bord"
            subtitle="Vue claire des finances, des lots et des incidents prioritaires."
        >
            <Head title="Tableau de bord" />

            <div className="space-y-5 sm:space-y-6">
                <section className="dashboard-appear dashboard-card rounded-lg bg-[#0F5132] p-4 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:p-6 lg:p-7">
                    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr] xl:items-end">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <Badge tone="green">
                                    {isGlobal
                                        ? "Vue globale"
                                        : selectedBuilding?.name ||
                                          "Vue bâtiment"}
                                </Badge>
                                <Badge tone="blue">
                                    {new Intl.DateTimeFormat("fr-FR", {
                                        month: "long",
                                        year: "numeric",
                                    }).format(new Date())}
                                </Badge>
                            </div>

                            <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                                Tableau de bord Syndicare
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/80">
                                Vue consolidée pour suivre la trésorerie, les
                                lots, les charges et les incidents à traiter.
                            </p>

                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg border border-emerald-300/30 bg-emerald-900/35 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                                        Recouvrement
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-white">
                                        {health.collectionRate ?? 0}%
                                    </p>
                                </div>
                                <div className="rounded-lg border border-amber-300/30 bg-amber-900/25 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100/75">
                                        Charges du mois
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-white">
                                        {formatCurrency(summary.chargesThisMonth)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-sky-300/30 bg-sky-900/25 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100/75">
                                        Impayés
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-white">
                                        {formatCurrency(summary.unpaidCharges)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
                            <label
                                htmlFor="building-filter"
                                className="text-sm font-semibold text-emerald-50"
                            >
                                Filtre immeuble
                            </label>
                            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <select
                                    id="building-filter"
                                    value={selectedBuildingId}
                                    onChange={(event) =>
                                        changeBuilding(event.target.value)
                                    }
                                    className="min-h-11 w-full rounded-md border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                >
                                    <option value="">Tous les bâtiments</option>
                                    {buildings.map((building) => (
                                        <option
                                            key={building.id}
                                            value={building.id}
                                        >
                                            {building.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <MetricCard
                        label={
                            isBuildingView
                                ? "Résidents"
                                : "Utilisateurs"
                        }
                        value={formatNumber(summary.users)}
                        helper={
                            isBuildingView
                                ? "Immeuble actif"
                                : "Tous les membres"
                        }
                        tone="green"
                        icon="users"
                    />
                    <MetricCard
                        label={
                            isBuildingView
                                ? "Bâtiment"
                                : "Bâtiments"
                        }
                        value={
                            isBuildingView
                                ? selectedBuilding?.name || "Bâtiment"
                                : formatNumber(summary.buildings)
                        }
                        helper={`${formatNumber(summary.apartments)} lots`}
                        tone="slate"
                        icon="building"
                    />
                    <MetricCard
                        label="Dépenses"
                        value={formatCurrency(summary.expensesThisMonth)}
                        helper="Ce mois"
                        tone="amber"
                        icon="expense"
                    />
                    <MetricCard
                        label="Impayés"
                        value={formatCurrency(summary.unpaidCharges)}
                        helper="A suivre"
                        tone="rose"
                        icon="alert"
                    />
                    <MetricCard
                        label="Charges"
                        value={formatCurrency(summary.chargesThisMonth)}
                        helper={`${formatNumber(summary.charges)} total`}
                        tone="blue"
                        icon="charge"
                    />
                    <MetricCard
                        label="Recouvrement"
                        value={`${health.collectionRate ?? 0}%`}
                        helper="Taux global"
                        tone="lime"
                        icon="rate"
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] xl:items-stretch">
                    <RevenueChart series={revenueSeries} />

                    <UnpaidChargesPanel charges={unpaidCharges} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-stretch">
                    <AnnouncementsPanel
                        announcements={recentAnnouncements}
                        isBuildingView={isBuildingView}
                        buildingName={selectedBuilding?.name}
                    />
                    <RecentTicketsPanel tickets={recentTickets} />
                </section>

            </div>
        </AdminLayout>
    );
}
