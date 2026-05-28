import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

const typeLabels = {
    Perdue: "Objet perdu",
    Trouve: "Objet trouve",
};

const statusLabels = {
    ouvert: "Ouvert",
    en_contact: "En contact",
    rendu: "Rendu",
    ferme: "Ferme",
};

const statusStyles = {
    ouvert: "bg-amber-100 text-amber-800",
    en_contact: "bg-sky-100 text-sky-800",
    rendu: "bg-emerald-100 text-emerald-800",
    ferme: "bg-slate-100 text-slate-700",
};

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

function TypeBadge({ type }) {
    const styles =
        type === "Trouve"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-rose-100 text-rose-800";

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
            {typeLabels[type] || type}
        </span>
    );
}

function StatCard({ label, value, tone }) {
    return (
        <div
            className={`rounded-[1.35rem] border bg-gradient-to-br p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${tone}`}
        >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
    );
}

function Pagination({ links }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-6 flex flex-wrap gap-2">
            {links.map((link, index) => {
                const label = String(link.label)
                    .replace("&laquo;", "<<")
                    .replace("&raquo;", ">>");

                return (
                    <Link
                        key={`${label}-${index}`}
                        href={link.url || ""}
                        preserveScroll
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            link.active
                                ? "border-[#0e3715] bg-[#0e3715] text-white"
                                : "border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50"
                        } ${!link.url ? "pointer-events-none opacity-50" : ""}`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}

function ItemCard({ item }) {
    return (
        <Link
            href={route("items.show", item.id)}
            className="group overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
        >
            <div className="grid gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div className="relative min-h-44 bg-gradient-to-br from-[#0e3715] via-emerald-700 to-[#d4af37]">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full min-h-44 items-center justify-center px-5 text-center">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-50/70">
                                    SyndiCare
                                </p>
                                <p className="mt-3 text-2xl font-black text-white">
                                    {item.type === "Trouve" ? "Trouve" : "Perdu"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate text-xl font-black text-slate-950">
                            {item.title || "Objet sans titre"}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-[#0e3715]">
                            {item.category}
                        </p>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                            {item.description}
                        </p>
                    </div>

                    <div className="mt-auto grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
                        <p className="truncate">
                            Lieu: {item.location || item.apartment?.building || "-"}
                        </p>
                        <p className="truncate">
                            Par: {item.user?.name || "Utilisateur"}
                        </p>
                        <p>{item.created_at}</p>
                        <p>{item.claims_count || 0} interaction(s)</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function Index({ items, filters = {}, stats = {} }) {
    const { data, setData, get } = useForm({
        search: filters.search || "",
        type: filters.type || "",
        status: filters.status || "",
    });

    const submit = (event) => {
        event.preventDefault();
        get(route("items.index"), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const rows = items?.data || [];

    return (
        <AdminLayout
            title="Objets perdus et trouves"
            subtitle="Declaration, suivi, suggestions automatiques et interaction entre residents."
            toolbar={
                <Link
                    href={route("items.create")}
                    className="inline-flex items-center justify-center rounded-full bg-[#0e3715] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14532d]"
                >
                    Declarer un objet
                </Link>
            }
        >
            <Head title="Objets perdus et trouves" />

            <div className="space-y-5 sm:space-y-6">
                <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0e3715] via-emerald-800 to-[#b8871d] p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-6">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-lime-300/20 blur-3xl" />
                    <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.32em] text-emerald-100/70">
                                Objets trouves
                            </p>
                            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                                Centraliser les objets signales par les residents
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">
                                Les locataires et coproprietaires recoivent une alerte,
                                et les declarations perdues proposent directement les
                                objets trouves similaires.
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className="rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur"
                        >
                            <div className="grid gap-2 sm:grid-cols-2">
                                <input
                                    value={data.search}
                                    onChange={(event) =>
                                        setData("search", event.target.value)
                                    }
                                    placeholder="Chercher un objet..."
                                    className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-emerald-300 focus:ring-emerald-200 sm:col-span-2"
                                />
                                <select
                                    value={data.type}
                                    onChange={(event) =>
                                        setData("type", event.target.value)
                                    }
                                    className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-emerald-300 focus:ring-emerald-200"
                                >
                                    <option value="">Tous les types</option>
                                    <option value="Perdue">Perdus</option>
                                    <option value="Trouve">Trouves</option>
                                </select>
                                <select
                                    value={data.status}
                                    onChange={(event) =>
                                        setData("status", event.target.value)
                                    }
                                    className="rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-emerald-300 focus:ring-emerald-200"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="ouvert">Ouvert</option>
                                    <option value="en_contact">En contact</option>
                                    <option value="rendu">Rendu</option>
                                    <option value="ferme">Ferme</option>
                                </select>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-black text-[#0e3715] transition hover:bg-[#e5c85f]">
                                    Filtrer
                                </button>
                                <Link
                                    href={route("items.index")}
                                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Reinitialiser
                                </Link>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        label="Objets perdus"
                        value={stats.lost || 0}
                        tone="border-rose-100 from-rose-50 to-white"
                    />
                    <StatCard
                        label="Objets trouves"
                        value={stats.found || 0}
                        tone="border-emerald-100 from-emerald-50 to-white"
                    />
                    <StatCard
                        label="Ouverts"
                        value={stats.open || 0}
                        tone="border-amber-100 from-amber-50 to-white"
                    />
                    <StatCard
                        label="En contact"
                        value={stats.inContact || 0}
                        tone="border-sky-100 from-sky-50 to-white"
                    />
                    <StatCard
                        label="Rendus"
                        value={stats.resolved || 0}
                        tone="border-teal-100 from-teal-50 to-white"
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    {rows.length === 0 && (
                        <div className="rounded-[1.75rem] border border-dashed border-emerald-200 bg-emerald-50/80 p-8 text-center text-emerald-800 xl:col-span-2">
                            Aucun objet ne correspond aux filtres.
                        </div>
                    )}

                    {rows.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </section>

                <Pagination links={items?.links} />
            </div>
        </AdminLayout>
    );
}
