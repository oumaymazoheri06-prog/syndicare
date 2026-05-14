import GenerateChargesButton from "@/Components/GenerateChargesButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

function formatCurrency(value) {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
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

function toneAccentClass(tone = "slate") {
    const tones = {
        slate: "bg-slate-500",
        green: "bg-emerald-600",
        amber: "bg-amber-500",
        red: "bg-rose-500",
        rose: "bg-rose-500",
        blue: "bg-sky-500",
        violet: "bg-violet-500",
        indigo: "bg-indigo-500",
        pink: "bg-pink-500",
        lime: "bg-lime-500",
    };

    return tones[tone] ?? tones.slate;
}

function toneSurfaceClass(tone = "slate") {
    const tones = {
        slate: "border-slate-200 bg-slate-50/80",
        green: "border-emerald-200 bg-emerald-50/80",
        amber: "border-amber-200 bg-amber-50/80",
        red: "border-rose-200 bg-rose-50/80",
        rose: "border-rose-200 bg-rose-50/80",
        blue: "border-sky-200 bg-sky-50/80",
        violet: "border-violet-200 bg-violet-50/80",
        indigo: "border-indigo-200 bg-indigo-50/80",
        pink: "border-pink-200 bg-pink-50/80",
        lime: "border-lime-200 bg-lime-50/80",
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

function MetricCard({ label, value, helper, tone = "green" }) {
    return (
        <div
            className={`dashboard-appear dashboard-card overflow-hidden rounded-lg border p-3.5 shadow-sm ${toneSurfaceClass(tone)}`}
        >
            <div
                className={`dashboard-accent-pulse mb-3 h-1.5 w-24 rounded-full ${toneAccentClass(tone)}`}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {label}
            </p>
            <p className="mt-1.5 text-xl font-bold text-slate-950 xl:text-2xl">
                {value}
            </p>
            {helper && <p className="mt-1.5 text-xs text-slate-500">{helper}</p>}
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

function EmptyState({ children = "Aucune donnee pour le moment." }) {
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
        { key: "expenses", color: "#0f766e", label: "Depenses" },
        { key: "charges", color: "#14532d", label: "Charges" },
        { key: "payments", color: "#b45309", label: "Paiements" },
    ];

    if (!data.length) {
        return <EmptyState>Aucune evolution mensuelle disponible.</EmptyState>;
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

            <div className="overflow-hidden rounded-lg bg-[#f7f4ee] p-3">
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

function QuickActions({
    isGlobal,
    buildingId = null,
    buildingName = null,
    canGenerateCharges = false,
    className = "",
}) {
    const actions = [
        {
            label: "Inviter un utilisateur",
            href: route("users.create"),
            tone: "green",
        },
        {
            label: "Nouvelle annonce",
            href: route("announcements.create"),
            tone: "blue",
        },
        {
            label: "Ajouter une depense",
            href: route("expenses.create"),
            tone: "amber",
        },
        {
            label: "Ajouter un document",
            href: route("documents.create"),
            tone: "slate",
        },
        {
            label: "Paiements a traiter",
            href: route("payments.index"),
            tone: "indigo",
        },
        {
            label: "Tickets urgents",
            href: route("tickets.index"),
            tone: "red",
        },
        {
            label: "Objets perdus",
            href: route("items.index"),
            tone: "pink",
        },
        {
            label: "Appartements",
            href: route("apartments.index"),
            tone: "lime",
        },
    ];

    return (
        <Panel
            title="Actions rapides"
            subtitle="Acces direct aux operations frequentes."
            action={
                canGenerateCharges ? (
                    <GenerateChargesButton
                        buildingId={isGlobal ? null : buildingId}
                        buildingName={buildingName}
                    />
                ) : null
            }
            className={`h-full ${className}`}
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={`dashboard-card group flex min-h-20 items-center justify-between rounded-lg border px-4 py-3.5 text-sm font-semibold shadow-sm ${badgeToneClass(action.tone)}`}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneAccentClass(action.tone)}`}
                            />
                            <span className="truncate">{action.label}</span>
                        </span>
                        <span className="shrink-0 text-lg leading-none transition group-hover:translate-x-1">
                            &gt;
                        </span>
                    </Link>
                ))}
            </div>
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
                        Lot concerne
                    </label>
                    <select
                        id="incident-apartment"
                        value={data.apartment_id}
                        onChange={(event) =>
                            setData("apartment_id", event.target.value)
                        }
                        className="mt-1.5 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="">Non precise</option>
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
                    Details
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
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0e3715] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? "Envoi..." : "Soumettre"}
                </button>
                {recentlySuccessful && (
                    <span className="text-sm font-semibold text-emerald-700">
                        Reclamation envoyee.
                    </span>
                )}
            </div>
        </form>
    );
}

function RoleHero({ badge, title, description, children }) {
    return (
        <section className="dashboard-appear dashboard-card rounded-lg bg-[#0f3c1d] p-4 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:p-6 lg:p-7">
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
        { key: "charges", color: "#aa7e16", label: "Appels de fonds" },
        { key: "payments", color: "#0f766e", label: "Paiements" },
    ];

    if (!data.length) {
        return <EmptyState>Aucune evolution personnelle disponible.</EmptyState>;
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
            <div className="overflow-hidden rounded-lg bg-[#f7f4ee] p-3">
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
        <div className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4">
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
        <div className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4">
            <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-950">{ticket.title}</p>
                <Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge>
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

    return (
        <AdminLayout
            title="Dashboard coproprietaire"
            subtitle="Solde personnel, appels de fonds, PV d'AG et incidents."
        >
            <Head title="Dashboard coproprietaire" />

            <div className="space-y-5 sm:space-y-6">
                <RoleHero
                    badge="Coproprietaire"
                    title={`Bonjour ${firstName(auth.user)}`}
                    description="Vue personnelle des lots detenus, du solde a regulariser, des appels de fonds et des documents d'assemblee generale."
                >
                    <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg border border-emerald-300/30 bg-emerald-900/35 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase text-emerald-100/70">
                                Lots
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                                {formatNumber(summary.lots)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-amber-300/30 bg-amber-900/25 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase text-amber-100/75">
                                Solde
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                                {formatCurrency(summary.balance)}
                            </p>
                        </div>
                        <div className="rounded-lg border border-sky-300/30 bg-sky-900/25 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase text-sky-100/75">
                                Incidents
                            </p>
                            <p className="mt-1 text-lg font-bold text-white">
                                {formatNumber(summary.openTickets)}
                            </p>
                        </div>
                    </div>
                </RoleHero>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Solde personnel"
                        value={formatCurrency(summary.balance)}
                        helper="Charges en attente ou en retard"
                        tone={Number(summary.balance || 0) > 0 ? "amber" : "green"}
                    />
                    <MetricCard
                        label="Appels du mois"
                        value={formatCurrency(summary.monthlyCharges)}
                        helper="Montant appele ce mois"
                        tone="blue"
                    />
                    <MetricCard
                        label="Paiements valides"
                        value={formatCurrency(summary.validatedPayments)}
                        helper="Historique personnel"
                        tone="green"
                    />
                    <MetricCard
                        label="Documents"
                        value={formatNumber(summary.documents)}
                        helper="PV d'AG et fichiers disponibles"
                        tone="slate"
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
                    <Panel
                        title="Mes lots"
                        subtitle="Situation par appartement detenu."
                    >
                        <CompactList
                            items={apartments}
                            empty="Aucun lot rattache a votre compte."
                        >
                            {(apartment) => (
                                <div
                                    key={apartment.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-950">
                                                Lot {apartment.number}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {apartment.building || "-"} - Etage{" "}
                                                {apartment.floor || "-"}
                                            </p>
                                        </div>
                                        <Badge
                                            tone={
                                                apartment.balance > 0
                                                    ? "amber"
                                                    : "green"
                                            }
                                        >
                                            {apartment.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                Surface
                                            </p>
                                            <p className="font-semibold text-slate-950">
                                                {formatNumber(apartment.area)} m2
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                Solde
                                            </p>
                                            <p className="font-semibold text-slate-950">
                                                {formatCurrency(apartment.balance)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                Incidents
                                            </p>
                                            <p className="font-semibold text-slate-950">
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
                        title="Declarer un incident"
                        subtitle="Maintenance, panne ou anomalie technique."
                    >
                        <IncidentForm apartments={apartments} />
                    </Panel>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
                    <Panel
                        title="Historique des appels de fonds"
                        subtitle="Charges rattachees a vos lots."
                    >
                        <CompactList
                            items={charges}
                            empty="Aucun appel de fonds trouve."
                        >
                            {(charge) => (
                                <div
                                    key={charge.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
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
                                            {charge.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-lg font-bold text-slate-950">
                                            {formatCurrency(charge.amount)}
                                        </p>
                                        {charge.receipt_path && (
                                            <a
                                                href={documentHref(
                                                    charge.receipt_path,
                                                )}
                                                className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Justificatif
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <div className="space-y-6">
                        <Panel
                            title="Evolution personnelle"
                            subtitle="Appels de fonds et paiements valides."
                        >
                            <OwnerLineChart data={monthlySeries} />
                        </Panel>

                        <Panel
                            title="Paiements"
                            subtitle="Dernieres operations enregistrees."
                        >
                            <CompactList
                                items={payments}
                                empty="Aucun paiement trouve."
                            >
                                {(payment) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {payment.charge || "Charge"} -{" "}
                                                    {payment.payment_date}
                                                </p>
                                            </div>
                                            <Badge
                                                tone={statusTone(payment.status)}
                                            >
                                                {payment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </CompactList>
                        </Panel>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-3 xl:items-start">
                    <Panel
                        title="PV d'AG et documents"
                        subtitle="Fichiers disponibles au telechargement."
                    >
                        <CompactList
                            items={documents}
                            empty="Aucun document disponible."
                        >
                            {(document) => (
                                <div
                                    key={document.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
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
                                            href={documentHref(document.file_path)}
                                            className="mt-3 inline-flex rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Telecharger
                                        </a>
                                    )}
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Annonces recentes"
                        subtitle="Communications liees a vos immeubles."
                    >
                        <CompactList
                            items={announcements}
                            empty="Aucune annonce recente."
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
                        subtitle="Suivi de vos declarations techniques."
                    >
                        <CompactList
                            items={tickets}
                            empty="Aucun incident declare."
                        >
                            {(ticket) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            )}
                        </CompactList>
                    </Panel>
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
            title="Dashboard locataire"
            subtitle="Mur d'annonces et reclamations techniques."
        >
            <Head title="Dashboard locataire" />

            <div className="space-y-5 sm:space-y-6">
                <RoleHero
                    badge="Locataire"
                    title={`Bonjour ${firstName(auth.user)}`}
                    description="Acces restreint aux communications de l'immeuble et au suivi des reclamations techniques."
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
                                Cloturees
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
                        helper="Logement rattache au compte"
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
                        label="Reclamations traitees"
                        value={formatNumber(summary.closedTickets)}
                        helper="Historique cloture"
                        tone="green"
                    />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
                    <Panel
                        title="Mur d'annonces"
                        subtitle="Informations partagees avec les residents."
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
                            title="Nouvelle reclamation"
                            subtitle="Declaration technique uniquement."
                        >
                            <IncidentForm apartments={apartments} />
                        </Panel>

                        <Panel
                            title="Appartement occupe"
                            subtitle="Logement associe a votre compte."
                        >
                            <CompactList
                                items={apartments}
                                empty="Aucun appartement rattache."
                            >
                                {(apartment) => (
                                    <div
                                        key={apartment.id}
                                        className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                    >
                                        <p className="font-semibold text-slate-950">
                                            Appartement {apartment.number}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {apartment.building || "-"} - Etage{" "}
                                            {apartment.floor || "-"}
                                        </p>
                                    </div>
                                )}
                            </CompactList>
                        </Panel>
                    </div>
                </section>

                <Panel
                    title="Mes reclamations techniques"
                    subtitle="Etat des demandes envoyees au syndic."
                >
                    <CompactList
                        items={tickets}
                        empty="Aucune reclamation technique envoyee."
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
    monthlySeries = [],
    chargeStatuses = {},
    ticketStatuses = {},
    buildings = [],
    recentCharges = [],
    recentExpenses = [],
    priorityCharges = [],
    pendingPayments = [],
    urgentTickets = [],
    recentAnnouncements = [],
    recentDocuments = [],
    recentItems = [],
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
    const canGenerateCharges = auth?.user?.role === "Syndic";

    const changeBuilding = (buildingId) => {
        window.location.href = buildingId
            ? `/dashboard?building_id=${buildingId}`
            : "/dashboard";
    };

    const chargeStatusRows = [
        {
            label: "Payees",
            value: chargeStatuses.paid || 0,
            tone: "green",
        },
        {
            label: "En attente",
            value: chargeStatuses.pending || 0,
            tone: "amber",
        },
        {
            label: "En retard",
            value: chargeStatuses.overdue || 0,
            tone: "red",
        },
    ];

    const ticketStatusRows = [
        {
            label: "Ouverts",
            value: ticketStatuses.open || 0,
            tone: "amber",
        },
        {
            label: "En cours",
            value: ticketStatuses.in_progress || 0,
            tone: "blue",
        },
        {
            label: "Fermes",
            value: ticketStatuses.closed || 0,
            tone: "green",
        },
    ];

    const healthCards = [
        {
            label: "Taux de recouvrement",
            value: `${health.collectionRate ?? 0}%`,
            tone: "green",
            progress: health.collectionRate ?? 0,
        },
        {
            label: "Paiements a valider",
            value: health.pendingPayments ?? 0,
            tone: "amber",
        },
        {
            label: "Charges en retard",
            value: health.overdueCharges ?? 0,
            tone: "red",
        },
        {
            label: "Tickets ouverts",
            value: health.openTickets ?? 0,
            tone: "blue",
        },
        {
            label: "Objets ouverts",
            value: health.openItems ?? 0,
            tone: "violet",
        },
        {
            label: "Documents",
            value: health.documents ?? 0,
            tone: "slate",
        },
    ];

    return (
        <AdminLayout
            title="Dashboard"
            subtitle="Pilotage financier, suivi des residents, incidents, documents et communications."
        >
            <Head title="Dashboard" />

            <div className="space-y-5 sm:space-y-6">
                <section className="dashboard-appear dashboard-card rounded-lg bg-[#0f3c1d] p-4 text-white shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:p-6 lg:p-7">
                    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr] xl:items-end">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <Badge tone="green">
                                    {isGlobal
                                        ? "Vue globale"
                                        : selectedBuilding?.name ||
                                          "Vue batiment"}
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
                                Vue consolidee des charges, paiements,
                                depenses, tickets, objets perdus et documents.
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
                                        A valider
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-white">
                                        {health.pendingPayments ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-sky-300/30 bg-sky-900/25 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100/75">
                                        Tickets actifs
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-white">
                                        {health.openTickets ?? 0}
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
                                    <option value="">Tous les batiments</option>
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

                <QuickActions
                    isGlobal={!selectedBuildingId}
                    buildingId={selectedBuildingId || null}
                    buildingName={selectedBuilding?.name}
                    canGenerateCharges={canGenerateCharges}
                />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label={
                            isBuildingView
                                ? "Residents du batiment"
                                : "Utilisateurs"
                        }
                        value={formatNumber(summary.users)}
                        helper={
                            isBuildingView
                                ? "Coproprietaires et locataires lies au batiment"
                                : "Syndic, coproprietaires et locataires"
                        }
                        tone="green"
                    />
                    <MetricCard
                        label={
                            isBuildingView
                                ? "Batiment selectionne"
                                : "Batiments"
                        }
                        value={
                            isBuildingView
                                ? selectedBuilding?.name || "Batiment"
                                : formatNumber(summary.buildings)
                        }
                        helper={`${formatNumber(summary.apartments)} appartements`}
                        tone="slate"
                    />
                    <MetricCard
                        label="Depenses du mois"
                        value={formatCurrency(summary.expensesThisMonth)}
                        helper="Budget engage"
                        tone="amber"
                    />
                    <MetricCard
                        label="Impayes"
                        value={formatCurrency(summary.unpaidCharges)}
                        helper="Charges pending et overdue"
                        tone="rose"
                    />
                    <MetricCard
                        label="Charges du mois"
                        value={formatCurrency(summary.chargesThisMonth)}
                        helper={`${formatNumber(summary.charges)} charges au total`}
                        tone="blue"
                    />
                    <MetricCard
                        label="Paiements valides"
                        value={formatCurrency(
                            summary.validatedPaymentsThisMonth,
                        )}
                        helper={`${formatNumber(summary.payments)} paiements suivis`}
                        tone="green"
                    />
                    <MetricCard
                        label="Tickets"
                        value={formatNumber(summary.tickets)}
                        helper="Maintenance et demandes residents"
                        tone="violet"
                    />
                    <MetricCard
                        label="Objets perdus"
                        value={formatNumber(summary.items)}
                        helper="Declarations et reclamations"
                        tone="slate"
                    />
                </section>

                <Panel
                    title="Sante operationnelle"
                    subtitle="Indicateurs prioritaires pour le suivi du syndic."
                >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                        {healthCards.map((item) => (
                            <div
                                key={item.label}
                                className={`dashboard-card rounded-lg border p-3.5 ${toneSurfaceClass(item.tone)}`}
                            >
                                <div
                                    className={`mb-3 h-1.5 w-16 rounded-full ${toneAccentClass(item.tone)}`}
                                />
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-slate-600">
                                        {item.label}
                                    </p>
                                    <Badge tone={item.tone}>{item.value}</Badge>
                                </div>
                                {item.progress !== undefined && (
                                    <div className="mt-4">
                                        <ProgressBar
                                            value={item.progress}
                                            tone={item.tone}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Panel>

                <section className="grid gap-6 xl:grid-cols-3 xl:items-start">
                    <Panel
                        title="Tickets urgents"
                        subtitle="Maintenance et incidents actifs a traiter en priorite."
                        action={
                            <Link
                                href={route("tickets.index")}
                                className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                            >
                                Voir tickets
                            </Link>
                        }
                    >
                        <CompactList
                            items={urgentTickets}
                            empty="Aucun ticket urgent."
                        >
                            {(ticket) => (
                                <div
                                    key={ticket.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold text-slate-950">
                                            {ticket.title}
                                        </p>
                                        <Badge tone={statusTone(ticket.status)}>
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {ticket.building || "-"} -{" "}
                                        {ticket.apartment || "-"}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {ticket.created_by || "Resident"} -{" "}
                                        {ticket.created_at || "-"}
                                    </p>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Paiements a valider"
                        subtitle="Preuves de paiement en attente de controle."
                    >
                        <CompactList
                            items={pendingPayments}
                            empty="Aucun paiement en attente."
                        >
                            {(payment) => (
                                <div
                                    key={payment.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-950">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {payment.resident || "Resident"}
                                            </p>
                                        </div>
                                        <Badge tone={statusTone(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-700">
                                        {payment.charge || "Charge"}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {payment.building || "-"} -{" "}
                                        {payment.apartment || "-"}
                                    </p>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Charges prioritaires"
                        subtitle="Relance et recouvrement des encours."
                    >
                        <CompactList
                            items={priorityCharges}
                            empty="Aucune charge prioritaire."
                        >
                            {(charge) => (
                                <div
                                    key={charge.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-950">
                                                {charge.description}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {charge.building || "-"} -{" "}
                                                {charge.apartment || "-"}
                                            </p>
                                        </div>
                                        <Badge tone={statusTone(charge.status)}>
                                            {charge.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-lg font-bold text-slate-950">
                                        {formatCurrency(charge.amount)}
                                    </p>
                                </div>
                            )}
                        </CompactList>
                    </Panel>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
                    <Panel
                        title="Parc immobilier"
                        subtitle="Occupation, surface, depenses et charges par immeuble."
                    >
                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {buildings.map((building) => {
                                const expenses =
                                    building.currentMonthExpenses ??
                                    building.expenses ??
                                    0;
                                const charges =
                                    building.currentMonthCharges ??
                                    building.charges ??
                                    0;

                                return (
                                    <div
                                        key={building.id}
                                        className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold text-slate-950">
                                                    {building.name}
                                                </p>
                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {building.address}
                                                </p>
                                            </div>
                                            <Badge tone="green">
                                                {building.occupancyRate ?? 0}%
                                            </Badge>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-slate-500">
                                                    Appartements
                                                </p>
                                                <p className="font-semibold text-slate-950">
                                                    {formatNumber(
                                                        building.apartments,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">
                                                    Occupes
                                                </p>
                                                <p className="font-semibold text-slate-950">
                                                    {formatNumber(
                                                        building.occupied,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">
                                                    Depenses
                                                </p>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(expenses)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">
                                                    Charges
                                                </p>
                                                <p className="font-semibold text-slate-950">
                                                    {formatCurrency(charges)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <ProgressBar
                                                value={
                                                    building.occupancyRate ?? 0
                                                }
                                                tone="green"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    <div className="space-y-6">
                        <Panel
                            title="Depenses recentes"
                            subtitle="Dernieres sorties budgetaires."
                        >
                            <CompactList
                                items={recentExpenses}
                                empty="Aucune depense recente."
                            >
                                {(expense) => (
                                    <div
                                        key={expense.id}
                                        className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                    >
                                        <p className="font-semibold text-slate-950">
                                            {expense.title ||
                                                expense.description}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {expense.building || "-"} -{" "}
                                            {expense.date || "-"}
                                        </p>
                                        <p className="mt-2 font-bold text-slate-950">
                                            {formatCurrency(expense.amount)}
                                        </p>
                                    </div>
                                )}
                            </CompactList>
                        </Panel>

                        <Panel
                            title="Charges recentes"
                            subtitle="Dernieres charges creees."
                        >
                            <CompactList
                                items={recentCharges}
                                empty="Aucune charge recente."
                            >
                                {(charge) => (
                                    <div
                                        key={charge.id}
                                        className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-semibold text-slate-950">
                                                {charge.description}
                                            </p>
                                            <Badge
                                                tone={statusTone(
                                                    charge.status,
                                                )}
                                            >
                                                {charge.status}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {charge.building || "-"} -{" "}
                                            {charge.apartment || "-"} -{" "}
                                            {charge.date || "-"}
                                        </p>
                                        <p className="mt-2 font-bold text-slate-950">
                                            {formatCurrency(charge.amount)}
                                        </p>
                                    </div>
                                )}
                            </CompactList>
                        </Panel>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr] xl:items-start">
                    <Panel
                        title="Evolution mensuelle"
                        subtitle="Depenses, charges generees et paiements valides sur les 6 derniers mois."
                    >
                        <LineChart data={monthlySeries} />
                    </Panel>

                    <div className="space-y-6">
                        <Panel
                            title="Statut des charges"
                            subtitle="Recouvrement et retards a surveiller."
                        >
                            <StatusRows rows={chargeStatusRows} />
                        </Panel>

                        <Panel
                            title="Statut des tickets"
                            subtitle="Demandes ouvertes, en cours et fermees."
                        >
                            <StatusRows rows={ticketStatusRows} />
                        </Panel>

                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-3 xl:items-start">
                    <Panel
                        title="Annonces recentes"
                        subtitle="Communications envoyees aux residents."
                    >
                        <CompactList
                            items={recentAnnouncements}
                            empty="Aucune annonce recente."
                        >
                            {(announcement) => (
                                <div
                                    key={announcement.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold text-slate-950">
                                            {announcement.title}
                                        </p>
                                        <Badge tone="blue">
                                            {announcement.target_role}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {announcement.building} -{" "}
                                        {announcement.created_at}
                                    </p>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Documents"
                        subtitle="Derniers fichiers ajoutes."
                    >
                        <CompactList
                            items={recentDocuments}
                            empty="Aucun document recent."
                        >
                            {(document) => (
                                <div
                                    key={document.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <p className="font-semibold text-slate-950">
                                        {document.title}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {document.uploader || "Utilisateur"} -{" "}
                                        {document.created_at || "-"}
                                    </p>
                                </div>
                            )}
                        </CompactList>
                    </Panel>

                    <Panel
                        title="Objets perdus"
                        subtitle="Declarations recentes a suivre."
                    >
                        <CompactList
                            items={recentItems}
                            empty="Aucun objet recent."
                        >
                            {(item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-slate-100 bg-[#fffdf8] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold text-slate-950">
                                            {item.title}
                                        </p>
                                        <Badge tone={statusTone(item.status)}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500">
                                        {item.type} - {item.category}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {item.building || item.location || "-"}{" "}
                                        - {item.created_at || "-"}
                                    </p>
                                </div>
                            )}
                        </CompactList>
                    </Panel>
                </section>
            </div>
        </AdminLayout>
    );
}
