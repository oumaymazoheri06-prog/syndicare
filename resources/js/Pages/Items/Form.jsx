import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";

const categories = [
    "Cle",
    "Telephone",
    "Portefeuille",
    "Sac",
    "Document",
    "Vetement",
    "Bijou",
    "Autre",
];

const statuses = [
    { value: "ouvert", label: "Ouvert" },
    { value: "en_contact", label: "En contact" },
    { value: "rendu", label: "Rendu" },
    { value: "ferme", label: "Ferme" },
];

function Field({ label, error, children, className = "" }) {
    return (
        <div className={className}>
            <InputLabel value={label} />
            <div className="mt-1">{children}</div>
            <InputError message={error} className="mt-2" />
        </div>
    );
}

const inputClass =
    "block w-full rounded-2xl border-slate-200 bg-white shadow-sm focus:border-emerald-600 focus:ring-emerald-600";

export default function Form({ item, apartments = [] }) {
    const editing = Boolean(item);
    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? "put" : "post",
        title: item?.title || "",
        type: item?.type || "Perdue",
        category: item?.category || "",
        description: item?.description || "",
        location: item?.location || "",
        date: item?.date_value || "",
        apartment_id: item?.apartment?.id || "",
        status: item?.status || "ouvert",
        image: null,
    });

    const submit = (event) => {
        event.preventDefault();

        post(
            editing
                ? route("items.update", item.id)
                : route("items.store"),
            {
                forceFormData: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AdminLayout
            title={editing ? "Modifier l'objet" : "Declarer un objet"}
            subtitle="Un signalement clair aide les residents a identifier rapidement les objets similaires."
            toolbar={
                <Link
                    href={editing ? route("items.show", item.id) : route("items.index")}
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-[#0e3715]"
                >
                    Retour
                </Link>
            }
        >
            <Head title={editing ? "Modifier l'objet" : "Declarer un objet"} />

            <form
                onSubmit={submit}
                className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
            >
                <section className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <div className="bg-gradient-to-r from-[#0e3715] via-emerald-700 to-[#d4af37] px-5 py-4 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-100/70">
                            Fiche objet
                        </p>
                        <h2 className="mt-1 text-xl font-black">
                            Informations principales
                        </h2>
                    </div>

                    <div className="grid gap-5 p-5 md:grid-cols-2">
                        <Field label="Type" error={errors.type}>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {["Perdue", "Trouve"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setData("type", type)}
                                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                                            data.type === type
                                                ? "border-[#0e3715] bg-[#0e3715] text-white shadow-sm"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-emerald-50"
                                        }`}
                                    >
                                        {type === "Perdue"
                                            ? "Objet perdu"
                                            : "Objet trouve"}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field label="Categorie" error={errors.category}>
                            <select
                                value={data.category}
                                onChange={(event) =>
                                    setData("category", event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Choisir une categorie</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Titre" error={errors.title}>
                            <input
                                value={data.title}
                                onChange={(event) =>
                                    setData("title", event.target.value)
                                }
                                placeholder="Ex: Trousseau de cles avec badge"
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Date" error={errors.date}>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(event) =>
                                    setData("date", event.target.value)
                                }
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Lieu" error={errors.location}>
                            <input
                                value={data.location}
                                onChange={(event) =>
                                    setData("location", event.target.value)
                                }
                                placeholder="Hall, parking, ascenseur..."
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Appartement / immeuble" error={errors.apartment_id}>
                            <select
                                value={data.apartment_id}
                                onChange={(event) =>
                                    setData("apartment_id", event.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="">Non precise</option>
                                {apartments.map((apartment) => (
                                    <option key={apartment.id} value={apartment.id}>
                                        {apartment.label}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {editing && (
                            <Field label="Statut" error={errors.status}>
                                <select
                                    value={data.status}
                                    onChange={(event) =>
                                        setData("status", event.target.value)
                                    }
                                    className={inputClass}
                                >
                                    {statuses.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        <Field
                            label="Description"
                            error={errors.description}
                            className="md:col-span-2"
                        >
                            <textarea
                                value={data.description}
                                onChange={(event) =>
                                    setData("description", event.target.value)
                                }
                                rows="6"
                                placeholder="Couleur, marque, signes distinctifs, circonstances..."
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Photo optionnelle" error={errors.image} className="md:col-span-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setData("image", event.target.files[0])
                                }
                                className="block w-full rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-4 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#0e3715] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                            />
                        </Field>
                    </div>
                </section>

                <aside className="h-fit rounded-[2rem] border border-white/75 bg-gradient-to-br from-white via-emerald-50 to-amber-50 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700">
                        Workflow
                    </p>
                    <h3 className="mt-2 text-xl font-black text-slate-950">
                        Ce qui se passe apres
                    </h3>
                    <div className="mt-5 space-y-3">
                        {[
                            "Notification aux locataires et coproprietaires.",
                            "Si l'objet est perdu, suggestions depuis les objets trouves.",
                            "Les residents peuvent contacter le declarant depuis la fiche.",
                        ].map((text, index) => (
                            <div
                                key={text}
                                className="rounded-[1.2rem] border border-white/80 bg-white/80 p-4"
                            >
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0e3715]">
                                    Etape {index + 1}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {item?.image_url && (
                        <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-white/80 bg-white">
                            <img
                                src={item.image_url}
                                alt={item.title}
                                className="h-48 w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="mt-5 flex flex-col gap-2">
                        <PrimaryButton disabled={processing}>
                            {editing ? "Enregistrer" : "Declarer l'objet"}
                        </PrimaryButton>
                        <Link
                            href={route("items.index")}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Annuler
                        </Link>
                    </div>
                </aside>
            </form>
        </AdminLayout>
    );
}
