import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";

const typeLabels = {
    Perdue: "Objet perdu",
    Trouve: "Objet trouvé",
};

const statusLabels = {
    ouvert: "Ouvert",
    en_contact: "En contact",
    rendu: "Rendu",
    ferme: "Fermé",
};

const statusStyles = {
    ouvert: "bg-amber-100 text-amber-800",
    en_contact: "bg-sky-100 text-sky-800",
    rendu: "bg-emerald-100 text-emerald-800",
    ferme: "bg-slate-100 text-slate-700",
};

const statusTimeline = [
    {
        value: "ouvert",
        helper: "Signalement publié",
    },
    {
        value: "en_contact",
        helper: "Un résident a répondu",
    },
    {
        value: "rendu",
        helper: "Objet restitué",
    },
    {
        value: "ferme",
        helper: "Dossier archivé",
    },
];

function Badge({ children, tone = "slate" }) {
    const tones = {
        slate: "bg-slate-100 text-slate-700",
        green: "bg-emerald-100 text-emerald-800",
        amber: "bg-amber-100 text-amber-800",
        rose: "bg-rose-100 text-rose-800",
        sky: "bg-sky-100 text-sky-800",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
                tones[tone] || tones.slate
            }`}
        >
            {children}
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                statusStyles[status] || statusStyles.ouvert
            }`}
        >
            {statusLabels[status] || status}
        </span>
    );
}

function Detail({ label, value }) {
    return (
        <div className="rounded-[1.15rem] border border-slate-100 bg-white/85 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
                {value || "-"}
            </p>
        </div>
    );
}

function SuggestionCard({ suggestion }) {
    const item = suggestion.item;

    return (
        <Link
            href={route("items.show", item.id)}
            className="block rounded-[1.35rem] border border-emerald-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">
                        {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {item.category} - {item.location || "Lieu non précisé"}
                    </p>
                </div>
                <Badge tone="green">{suggestion.score}%</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {suggestion.reasons.map((reason) => (
                    <Badge key={reason} tone="sky">
                        {reason}
                    </Badge>
                ))}
            </div>
        </Link>
    );
}

function SectionPanel({ eyebrow, title, children, action, className = "" }) {
    return (
        <section
            className={`overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${className}`}
        >
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                            {eyebrow}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">
                            {title}
                        </h3>
                    </div>
                    {action}
                </div>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

export default function Show({
    item,
    suggestions = [],
    canManage = false,
    canInteract = true,
}) {
    const claimForm = useForm({
        message: "",
    });

    const submitClaim = (event) => {
        event.preventDefault();
        claimForm.post(route("items.claims.store", item.id), {
            preserveScroll: true,
            onSuccess: () => claimForm.reset("message"),
        });
    };

    const updateStatus = (status) => {
        router.patch(
            route("items.status.update", item.id),
            { status },
            { preserveScroll: true },
        );
    };
    const showSuggestions = item.type === "Perdue";
    const showSidebar = canManage || showSuggestions;
    const itemMeta = [
        { label: "Catégorie", value: item.category },
        { label: "Lieu", value: item.location },
        { label: "Date", value: item.date },
        { label: "Déclaré par", value: item.user?.name },
        {
            label: "Appartement",
            value: item.apartment
                ? `Appt ${item.apartment.number} - ${item.apartment.building || ""}`
                : null,
        },
        {
            label: "Interactions",
            value: `${item.claims_count || 0} message(s)`,
        },
    ];

    return (
        <AdminLayout
            title={item.title || "Objet"}
            subtitle="Fiche de suivi, suggestions et interactions résidents."
            toolbar={
                <div className="flex flex-wrap gap-2">
                    {canManage && (
                        <Link
                            href={route("items.edit", item.id)}
                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
                        >
                            Modifier
                        </Link>
                    )}
                    {canManage && (
                        <Link
                            href={route("items.destroy", item.id)}
                            method="delete"
                            as="button"
                            onClick={(event) => {
                                if (!window.confirm("Supprimer cet objet ?")) {
                                    event.preventDefault();
                                }
                            }}
                            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
                        >
                            Supprimer
                        </Link>
                    )}
                    <Link
                        href={route("items.index")}
                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0F5132]"
                    >
                        Liste
                    </Link>
                </div>
            }
        >
            <Head title={item.title || "Objet"} />

            <div className="space-y-5">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap gap-2">
                                <Badge tone={item.type === "Trouve" ? "green" : "rose"}>
                                    {typeLabels[item.type] || item.type}
                                </Badge>
                                <StatusBadge status={item.status} />
                            </div>
                            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                                {item.title}
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                Suivi du signalement, détails de localisation,
                                suggestions automatiques et messages des résidents.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3 sm:min-w-[320px]">
                            <div className="rounded-[1.1rem] bg-white p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                    Catégorie
                                </p>
                                <p className="mt-1 truncate text-sm font-black text-slate-900">
                                    {item.category || "-"}
                                </p>
                            </div>
                            <div className="rounded-[1.1rem] bg-white p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                    Messages
                                </p>
                                <p className="mt-1 text-sm font-black text-slate-900">
                                    {item.claims_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div
                    className={`grid gap-5 ${
                        showSidebar
                            ? "xl:grid-cols-[minmax(0,1fr)_380px]"
                            : "xl:grid-cols-1"
                    }`}
                >
                    <section className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                        <div className="grid gap-0 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
                            <div className="relative min-h-[280px] bg-slate-100 lg:min-h-[520px]">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full min-h-[280px] items-center justify-center p-8 text-center text-slate-700 lg:min-h-[520px]">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">
                                                SyndiCare
                                            </p>
                                            <p className="mt-4 text-5xl font-black">
                                                {item.type === "Trouve"
                                                    ? "Trouvé"
                                                    : "Perdu"}
                                            </p>
                                            <p className="mt-3 text-sm text-slate-500">
                                                Photo non ajoutée
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex min-w-0 flex-col p-5 sm:p-6">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                                        Description
                                    </p>
                                    <p className="mt-3 rounded-[1.35rem] border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-7 text-slate-700">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {itemMeta.map((detail) => (
                                        <Detail
                                            key={detail.label}
                                            label={detail.label}
                                            value={detail.value}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {showSidebar && (
                        <aside className="space-y-5 xl:sticky xl:top-36 xl:self-start">
                            {canManage && (
                                <SectionPanel
                                    eyebrow="Gestion statut"
                                    title="Cycle de vie"
                                >
                                    <div className="space-y-2.5">
                                        {statusTimeline.map((step) => (
                                            <button
                                                key={step.value}
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(step.value)
                                                }
                                                className={`w-full rounded-[1.2rem] border px-4 py-3 text-left transition ${
                                                    item.status === step.value
                                                        ? "border-[#0F5132] bg-[#0F5132] text-white shadow-sm"
                                                        : "border-slate-200 bg-white text-slate-700 hover:bg-emerald-50"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm font-black">
                                                        {statusLabels[step.value]}
                                                    </span>
                                                    {item.status === step.value && (
                                                        <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227]" />
                                                    )}
                                                </div>
                                                <p
                                                    className={`mt-1 text-xs ${
                                                        item.status === step.value
                                                            ? "text-emerald-50/75"
                                                            : "text-slate-500"
                                                    }`}
                                                >
                                                    {step.helper}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </SectionPanel>
                            )}

                            {showSuggestions && (
                                <SectionPanel
                                    eyebrow="Suggestions"
                                    title="Objets trouvés similaires"
                                    action={<Badge tone="amber">{suggestions.length}</Badge>}
                                >
                                    <div className="space-y-3">
                                        {suggestions.length === 0 && (
                                            <div className="rounded-[1.25rem] border border-dashed border-emerald-200 bg-emerald-50/80 p-4 text-sm leading-6 text-emerald-800">
                                                Aucune suggestion pour le moment.
                                                Les prochains objets trouvés seront
                                                comparés automatiquement.
                                            </div>
                                        )}
                                        {suggestions.map((suggestion) => (
                                            <SuggestionCard
                                                key={suggestion.item.id}
                                                suggestion={suggestion}
                                            />
                                        ))}
                                    </div>
                                </SectionPanel>
                            )}
                        </aside>
                    )}
                </div>

                <SectionPanel
                    eyebrow="Interactions"
                    title="Messages des utilisateurs"
                >
                    <div
                        className={`grid gap-5 ${
                            canInteract
                                ? "lg:grid-cols-[minmax(0,1fr)_420px]"
                                : "lg:grid-cols-1"
                        }`}
                    >
                        <div>
                            <div className="space-y-3">
                                {(!item.claims || item.claims.length === 0) && (
                                    <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                        Aucun message pour cet objet.
                                    </div>
                                )}

                                {item.claims?.map((claim) => (
                                    <div
                                        key={claim.id}
                                        className="rounded-[1.25rem] border border-slate-100 bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-black text-slate-950">
                                                    {claim.user?.name || "Utilisateur"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {claim.created_at}
                                                </p>
                                            </div>
                                            <Badge tone="sky">{claim.status}</Badge>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                            {claim.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {canInteract && (
                            <form
                                onSubmit={submitClaim}
                                className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <h4 className="text-lg font-black text-slate-950">
                                    Contacter le déclarant
                                </h4>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Envoyez un message si vous pensez reconnaître
                                    l'objet ou pouvoir aider.
                                </p>
                                <textarea
                                    value={claimForm.data.message}
                                    onChange={(event) =>
                                        claimForm.setData("message", event.target.value)
                                    }
                                    rows="5"
                                    className="mt-4 block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                                    placeholder="Votre message..."
                                />
                                <InputError
                                    message={claimForm.errors.message}
                                    className="mt-2"
                                />
                                <div className="mt-4">
                                    <PrimaryButton disabled={claimForm.processing}>
                                        Envoyer
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}
                    </div>
                </SectionPanel>
            </div>
        </AdminLayout>
    );
}
