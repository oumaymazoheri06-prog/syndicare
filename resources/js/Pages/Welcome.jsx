import { Head, Link } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { blogImageForLocale, blogPosts } from "./Blog/articles";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

const desktopShot = "/images/dashboard%20final.png";
const mobileShot = "/images/dashboardfinal%20movile.png";
const heroImage = "/images/hero.jpg";
const arabicDesktopShot = "/images/deskscreen.png";
const arabicMobileShot = "/images/phonescreen.png";
const LOT_MIN = 1;
const LOT_MAX = 1000;
const PRICING_PRESETS = [10, 45, 100, 200, 500];
const CONTACT_EMAIL = "syndicaremanager@gmail.com";
const WHATSAPP_URL = "https://wa.me/212663442169";
const INTRO_DURATION_MS = 3200;
const INTRO_STORAGE_KEY = "syndicare_landing_intro_seen_v2";

const landingNavLinks = [
    ["#produit", "Produit"],
    ["#fonctionnalites", "Fonctionnalités"],
    ["#tarifs", "Tarifs"],
    ["#testimonials", "Avis"],
    ["#faq", "FAQ"],
    ["#blog", "Blog"],
    ["#contact", "Contact"],
];

const syndicFeatures = [
    [
        "Gestion des lots",
        "Suivez les lots, résidents, immeubles et étages depuis un seul espace.",
    ],
    [
        "Suivi financier",
        "Contrôlez les charges, paiements, dépenses et reçus en temps réel.",
    ],
    [
        "Documents ciblés",
        "Partagez les documents par rôle, immeuble, lot ou pour tous.",
    ],
    [
        "Réclamations",
        "Centralisez les tickets et gardez un historique clair des échanges.",
    ],
    [
        "Annonces",
        "Diffusez les informations importantes aux résidents concernés.",
    ],
    [
        "Objets perdus",
        "Facilitez la déclaration et le rapprochement des objets retrouvés.",
    ],
];

const faqs = [
    [
        "Est-ce que SyndiCare gère plusieurs immeubles ?",
        "Oui. Le syndic peut organiser les immeubles, les étages, les lots et les résidents depuis le même espace.",
    ],
    [
        "Les locataires et copropriétaires voient-ils les mêmes données ?",
        "Non. Les permissions et le filtrage permettent de montrer seulement les informations qui concernent chaque utilisateur.",
    ],
    [
        "Peut-on suivre les réclamations ?",
        "Oui. Chaque ticket peut contenir un suivi avec les réponses du syndic et du résident.",
    ],
    [
        "Le simulateur de tarif est-il automatique ?",
        "Oui. Le montant estimé change selon le nombre de lots et le mode de facturation choisi.",
    ],
];

const dashboardPreviewStats = [
    {
        label: "Recouvrement",
        value: 78,
        suffix: "%",
        caption: "Charges du mois",
        tone: "emerald",
    },
    {
        label: "À valider",
        value: 23,
        suffix: "",
        caption: "Paiements reçus",
        tone: "amber",
    },
    {
        label: "Tickets actifs",
        value: 7,
        suffix: "",
        caption: "Demandes ouvertes",
        tone: "sky",
    },
    {
        label: "Impayés",
        value: 11172,
        suffix: " MAD",
        caption: "Charges en attente",
        tone: "rose",
    },
];

const dashboardPreviewTickets = [
    ["Julia Martin", "Fuite d’eau au parking", "Urgent"],
    ["Nadia El Idrissi", "Ascenseur bloqué", "En cours"],
    ["Youssef Amrani", "Éclairage palier", "Nouveau"],
];

const dashboardPreviewCharges = [
    ["Lot A-12", "554 MAD"],
    ["Lot B-08", "710 MAD"],
    ["Lot C-03", "430 MAD"],
];

const googleTestimonials = [
    {
        name: "Amina El Fassi",
        role: "Syndic professionnel",
        initials: "AE",
        time: "il y a 2 semaines",
        text: "Avant, je passais mes soirées à vérifier qui avait payé. Maintenant je retrouve l’information en quelques secondes. Franchement, ça m’a enlevé une bonne partie du stress de fin de mois.",
    },
    {
        name: "Youssef Amrani",
        role: "مسير إقامة",
        initials: "YA",
        time: "منذ شهر",
        text: "قبل كنت كنضيع وقت بزاف بين الواتساب وملفات إكسيل. دابا كلشي مجموع فبلاصة وحدة، وحتى السكان ولى ساهل عليهم يلقاو المعلومة.",
        language: "ar",
    },
    {
        name: "Nadia Bennani",
        role: "Copropriétaire",
        initials: "NB",
        time: "il y a 3 semaines",
        text: "Je ne suis pas très à l’aise avec les outils compliqués, mais ici j’ai vite compris où voir mes charges et mes reçus. Je consulte surtout depuis mon téléphone.",
    },
    {
        name: "Karim Alaoui",
        role: "مالك مشترك",
        initials: "KA",
        time: "منذ 3 أسابيع",
        text: "التطبيق بسيط وواضح. كنشوف المصاريف والإعلانات ديال العمارة بلا ما نبقى كل مرة نسول السنديك، وهاد الشي ريحني بزاف.",
        language: "ar",
    },
    {
        name: "Salma Rami",
        role: "Copropriétaire",
        initials: "SR",
        time: "il y a 1 semaine",
        text: "Quand j’ai signalé une fuite, j’ai pu suivre la réponse sans rappeler plusieurs fois. C’est surtout ce petit détail qui m’a convaincue.",
    },
];

const ecosystemActors = [
    ["SP", "Syndics professionnels", "Pilotage quotidien des immeubles"],
    ["CG", "Cabinets de gestion", "Suivi financier et administratif"],
    ["PM", "Prestataires maintenance", "Interventions et demandes terrain"],
    ["RP", "Résidences privées", "Communication avec les résidents"],
    ["CP", "Copropriétés", "Lots, appels de charges et documents"],
    ["CS", "Conseils syndicaux", "Vision claire des décisions"],
];

const trustFeatures = [
    [
        "Données structurées",
        "Charges, paiements, tickets et documents restent reliés au bon lot.",
    ],
    [
        "Accès par rôle",
        "Le syndic, le copropriétaire et le locataire voient seulement ce qui les concerne.",
    ],
    [
        "Historique clair",
        "Les validations, notifications et changements importants restent traçables.",
    ],
    [
        "Français / Arabe",
        "L’interface accompagne les résidents dans les deux langues.",
    ],
    [
        "Loi 18-00",
        "Une organisation pensée pour le contexte de la copropriété au Maroc.",
    ],
];

function priceForLots(lots) {
    if (lots < 20) {
        return 100;
    }

    if (lots <= 100) {
        return lots * 4.7;
    }

    return lots * 4.5;
}

function pricingDétailsForLots(lots) {
    if (lots < 20) {
        return {
            monthlyBase: 100,
            rateLabel: "Forfait minimum",
            calculation: "100 Dh / mois jusqu'à 19 lots",
        };
    }

    const rate = lots <= 100 ? 4.7 : 4.5;

    return {
        monthlyBase: priceForLots(lots),
        rateLabel: `${rate.toLocaleString("fr-FR")} Dh / lot`,
        calculation: `${lots} lots x ${rate.toLocaleString("fr-FR")} Dh`,
    };
}

function formatPrice(value) {
    return `${Math.round(value).toLocaleString("fr-FR")} Dh`;
}

function normalizeLots(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return LOT_MIN;
    }

    return Math.min(LOT_MAX, Math.max(LOT_MIN, Math.round(parsed)));
}

function useReplayInView({
    rootMargin = "0px 0px -12% 0px",
    threshold = 0.22,
} = {}) {
    const ref = useRef(null);
    const wasVisibleRef = useRef(false);
    const [isVisible, setIsVisible] = useState(false);
    const [playKey, setPlayKey] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        if (!("IntersectionObserver" in window)) {
            setIsVisible(true);
            setPlayKey((current) => current + 1);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);

                    if (!wasVisibleRef.current) {
                        setPlayKey((current) => current + 1);
                    }

                    wasVisibleRef.current = true;
                    return;
                }

                setIsVisible(false);
                wasVisibleRef.current = false;
            },
            { rootMargin, threshold },
        );

        const node = ref.current;

        if (node) {
            observer.observe(node);
        }

        return () => observer.disconnect();
    }, [rootMargin, threshold]);

    return { ref, isVisible, playKey };
}

function useAnimatedNumber(target, playKey = 0, isActive = true, delay = 0) {
    const [value, setValue] = useState(target);

    useEffect(() => {
        if (!isActive) {
            setValue(target);
            return undefined;
        }

        if (typeof window === "undefined") {
            setValue(target);
            return undefined;
        }

        const duration = 1100;
        let frameId;
        let startedAt;
        const startValue = Math.max(0, Math.round(target * 0.28));

        const tick = (now) => {
            if (!startedAt) {
                startedAt = now;
                setValue(startValue);
            }

            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;

            setValue(Math.round(startValue + (target - startValue) * eased));

            if (progress < 1) {
                frameId = window.requestAnimationFrame(tick);
            }
        };

        const timeoutId = window.setTimeout(() => {
            frameId = window.requestAnimationFrame(tick);
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);

            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, [target, playKey, isActive, delay]);

    return value;
}

function AnimatedStat({ stat, index, playKey = 0, isActive = true }) {
    const value = useAnimatedNumber(stat.value, playKey, isActive, index * 90);
    const toneClasses = {
        emerald: "border-emerald-100 bg-emerald-50 text-emerald-950",
        amber: "border-amber-100 bg-amber-50 text-amber-950",
        sky: "border-sky-100 bg-sky-50 text-sky-950",
        rose: "border-rose-100 bg-rose-50 text-rose-950",
    };

    return (
        <div
            className={`landing-stat-card landing-animated-stat relative overflow-hidden rounded-2xl border p-4 shadow-sm ${toneClasses[stat.tone]}`}
            style={{ animationDelay: `${index * 90}ms` }}
        >
            <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">
                {stat.label}
            </p>
            <p className="mt-3 text-2xl font-black leading-none sm:text-3xl">
                {value.toLocaleString("fr-FR")}
                {stat.suffix}
            </p>
            <p className="mt-2 text-xs font-semibold opacity-70">
                {stat.caption}
            </p>
        </div>
    );
}

function AnimatedMetricValue({
    value,
    playKey = 0,
    isActive = true,
    delay = 0,
}) {
    const textValue = String(value);
    const match = textValue.match(/^([+]?)(\d+)(.*)$/);
    const animatedValue = useAnimatedNumber(
        match ? Number(match[2]) : 0,
        playKey,
        isActive,
        delay,
    );

    if (!match) {
        return textValue;
    }

    const [, prefix, , suffix] = match;

    return `${prefix}${animatedValue.toLocaleString("fr-FR")}${suffix}`;
}

function EcosystemMarquee() {
    return (
        <section
            className="border-b border-emerald-950/10 bg-white"
            aria-label="Écosystème SyndiCare"
        >
            <div className="mx-auto flex max-w-[112rem] flex-col gap-3 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                        Écosystème
                    </p>
                    <h2 className="mt-2 text-xl font-black text-[#0F5132] sm:text-2xl">
                        Pensé pour tout l’écosystème de la copropriété.
                    </h2>
                </div>
                <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
                    SyndiCare connecte les acteurs qui participent à la gestion,
                    au suivi et à la communication autour des immeubles.
                </p>
            </div>

            <div className="landing-ecosystem-marquee overflow-hidden border-t border-emerald-950/10 bg-[#f8faf8]">
                <div className="landing-ecosystem-track flex w-max gap-3 py-4">
                    {[0, 1].map((group) => (
                        <div
                            key={group}
                            className="flex shrink-0 gap-3"
                            aria-hidden={group === 1 ? "true" : undefined}
                        >
                            {ecosystemActors.map(
                                ([badge, title, description]) => (
                                    <article
                                        key={`${group}-${title}`}
                                        className="flex w-[17rem] shrink-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm sm:w-[19rem]"
                                    >
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C9A227] text-xs font-black text-white">
                                            {badge}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-black text-[#0F5132]">
                                                {title}
                                            </span>
                                            <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                                                {description}
                                            </span>
                                        </span>
                                    </article>
                                ),
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TrustHighlights() {
    return (
        <section className="border-b border-emerald-950/10 bg-[#f8faf8]">
            <div className="mx-auto grid max-w-[112rem] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-10">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                        Confiance
                    </p>
                    <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl">
                        Des repères rassurants pour le syndic et les résidents.
                    </h2>
                    <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
                        La landing montre que le projet ne se limite pas à une
                        interface: il respecte les rôles, les données et le
                        suivi métier.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {trustFeatures.map(([title, description], index) => (
                        <article
                            key={title}
                            className="landing-stat-card rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <span className="block h-1.5 w-8 rounded-full bg-[#C9A227]" />
                            <h3 className="mt-3 text-sm font-black text-slate-950">
                                {title}
                            </h3>
                            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                                {description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function StarRating() {
    return (
        <div className="flex items-center gap-0.5" aria-label="5 étoiles">
            {[0, 1, 2, 3, 4].map((star) => (
                <svg
                    key={star}
                    className="h-4 w-4 text-[#fbbc04]"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        fill="currentColor"
                        d="M10 1.5l2.55 5.17 5.7.83-4.12 4.02.97 5.68L10 14.52 4.9 17.2l.97-5.68L1.75 7.5l5.7-.83L10 1.5z"
                    />
                </svg>
            ))}
        </div>
    );
}

function GoogleMark({ className = "h-5 w-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
            />
        </svg>
    );
}

function WhatsAppMark({ className = "h-5 w-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12.04 2.1a9.86 9.86 0 0 0-8.52 14.82L2.4 21.9l5.1-1.08a9.83 9.83 0 0 0 4.54 1.1h.01a9.91 9.91 0 0 0-.01-19.82Zm0 18.14a8.18 8.18 0 0 1-4.16-1.14l-.3-.18-3.02.64.64-2.94-.2-.31a8.18 8.18 0 1 1 7.04 3.93Zm4.49-6.13c-.25-.12-1.45-.71-1.68-.79-.22-.08-.39-.12-.55.12-.16.25-.63.79-.77.95-.14.16-.28.18-.52.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.45-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.28.37-.42.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"
            />
        </svg>
    );
}

function GmailMark({ className = "h-5 w-5" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M4.75 6.75h14.5v10.5H4.75V6.75Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="m5.25 7.25 6.75 5.1 6.75-5.1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function BlogSection({ localizedBlogImage }) {
    return (
        <section
            id="blog"
            className="border-y border-emerald-950/10 bg-white py-12 sm:py-14 lg:py-16"
        >
            <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                            Blog
                        </p>
                        <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl lg:text-4xl">
                            Des conseils pratiques pour gérer une copropriété
                            avec plus de clarté.
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                            Une sélection de contenus courts pour aider les
                            syndics à mieux organiser les finances, les
                            documents et la relation avec les résidents.
                        </p>
                    </div>
                    <a
                        href="#contact"
                        className="inline-flex w-fit justify-center rounded-full border border-emerald-900/15 bg-[#f8faf8] px-5 py-3 text-sm font-black text-[#0F5132] transition hover:bg-emerald-50"
                    >
                        Recevoir une démo
                    </a>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {blogPosts.map((post, index) => (
                        <Link
                            href={post.href}
                            key={post.title}
                            className={`group overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-[#f8faf8] shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10 ${
                                index === 0 ? "" : "flex md:block"
                            }`}
                        >
                            <img
                                src={localizedBlogImage(post)}
                                alt={post.title}
                                className={`object-cover object-left-top transition duration-500 group-hover:scale-[1.03] ${
                                    index === 0
                                        ? "aspect-[16/10] w-full"
                                        : "h-32 w-32 shrink-0 md:aspect-[16/10] md:h-auto md:w-full"
                                }`}
                            />
                            <div
                                className={`p-4 sm:p-5 ${
                                    index === 0 ? "" : "min-w-0 flex-1"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.16em]">
                                    <span className="text-emerald-700">
                                        {post.category}
                                    </span>
                                    <span className="text-slate-400">
                                        {post.readTime}
                                    </span>
                                </div>
                                <h3 className="mt-4 text-xl font-black leading-tight text-[#0F5132]">
                                    {post.title}
                                </h3>
                                <p
                                    className={`mt-3 text-sm leading-6 text-slate-600 ${
                                        index === 0 ? "" : "hidden md:block"
                                    }`}
                                >
                                    {post.description}
                                </p>
                                <p
                                    className={`mt-5 text-sm font-black text-[#0F5132] ${
                                        index === 0 ? "" : "hidden md:block"
                                    }`}
                                >
                                    Lire l'article
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ContactSection() {
    return (
        <section
            id="contact"
            className="scroll-mt-28 bg-[#f8faf8] px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16"
        >
            <div className="mx-auto max-w-5xl">
                <div className="landing-stat-card rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-950/10 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                            Prêt à tester
                        </p>
                        <span className="landing-flow-pulse h-3 w-3 rounded-full bg-[#C9A227]" />
                    </div>

                    <h2 className="mt-4 text-2xl font-black leading-tight text-[#0F5132] sm:text-3xl">
                        Lancez une gestion plus claire dès cette semaine.
                    </h2>
                    <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                        Présentez vos immeubles, vos lots et votre méthode
                        actuelle. SyndiCare vous aide à organiser le suivi dans
                        une plateforme unique.
                    </p>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        {[
                            [
                                "01",
                                "Démo ciblée",
                                "Vision claire sur vos besoins réels.",
                            ],
                            [
                                "02",
                                "Structure des lots",
                                "Immeubles, résidents et charges organisés.",
                            ],
                            [
                                "03",
                                "Lancement simple",
                                "Un espace prêt pour le syndic et les résidents.",
                            ],
                        ].map(([step, title, description], index) => (
                            <div
                                key={title}
                                className="landing-stat-card flex gap-3 rounded-2xl border border-slate-200 bg-[#f8faf8] p-4"
                                style={{
                                    animationDelay: `${180 + index * 120}ms`,
                                }}
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#0F5132] shadow-sm">
                                    {step}
                                </span>
                                <span>
                                    <span className="block text-sm font-black text-slate-950">
                                        {title}
                                    </span>
                                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                                        {description}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700 bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-950/10"
                        >
                            <WhatsAppMark className="h-5 w-5" />
                            Contacter sur WhatsApp
                        </a>
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-900/15 bg-white px-5 py-3 text-sm font-black text-[#0F5132] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-950/10"
                        >
                            <GmailMark className="h-5 w-5" />
                            Gmail
                        </a>
                    </div>

                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="mt-4 flex items-center gap-3 truncate rounded-2xl border border-slate-200 bg-[#f8faf8] px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-emerald-200 hover:text-[#0F5132]"
                    >
                        <GmailMark className="h-5 w-5 shrink-0" />
                        <span className="truncate">{CONTACT_EMAIL}</span>
                    </a>

                    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <p className="text-sm font-black text-[#0F5132]">
                            Réponse rapide
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            Idéal pour valider le périmètre, les lots et le
                            premier immeuble à configurer.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProductExperiencePreview() {
    const { ref: previewRef, isVisible } = useReplayInView();
    const hasAutoHintedRef = useRef(false);

    useEffect(() => {
        if (
            !isVisible ||
            hasAutoHintedRef.current ||
            typeof window === "undefined" ||
            window.innerWidth >= 1280 ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const container = previewRef.current;

        if (!container) {
            return;
        }

        hasAutoHintedRef.current = true;

        const timer = window.setTimeout(() => {
            container.scrollBy({
                left: 75,
                behavior: "smooth",
            });

            window.setTimeout(() => {
                container.scrollTo({
                    left: 0,
                    behavior: "smooth",
                });
            }, 650);
        }, 900);

        return () => window.clearTimeout(timer);
    }, [isVisible, previewRef]);
    const syndicActions = [
        [
            "Structure du parc",
            "Immeubles, étages, lots et résidents réunis dans un seul espace.",
        ],
        [
            "Gestion quotidienne",
            "Charges, documents et demandes restent liés aux bonnes personnes.",
        ],
        [
            "Diffusion ciblée",
            "Chaque information est partagée selon le rôle, l’immeuble ou le lot.",
        ],
    ];
    const residentActions = [
        [
            "Consulter ses charges",
            "Un solde et un historique faciles à retrouver.",
        ],
        ["Envoyer un paiement", "Une preuve transmise directement au syndic."],
        [
            "Suivre ses demandes",
            "Des réponses et des statuts visibles au même endroit.",
        ],
    ];
    const flowSteps = [
        [
            "Le syndic publie",
            "Une charge, un document ou une annonce est ciblé.",
        ],
        ["Le résident agit", "Il consulte, paie ou ouvre une demande."],
        ["La plateforme met à jour", "Les informations restent synchronisées."],
        ["Chacun est informé", "Une notification confirme l’avancement."],
    ];

    return (
        <div
            ref={previewRef}
            className={`landing-product-preview mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:grid xl:grid-cols-[1.05fr_0.95fr_0.9fr] xl:overflow-visible xl:pb-0 ${isVisible ? "is-visible" : ""}`}
        >
            <article className="min-w-[88%] snap-start xl:min-w-0 landing-stat-card overflow-hidden rounded-2xl border border-emerald-100 bg-[#f8faf8] p-5 shadow-sm sm:rounded-[2rem] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                            Console syndic
                        </p>
                        <h3 className="mt-2 text-xl font-black text-[#0F5132]">
                            Le syndic organise
                        </h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-[#0F5132]">
                        Espace central
                    </span>
                </div>

                <div className="mt-5 grid gap-3">
                    {syndicActions.map(([title, description], index) => (
                        <div
                            key={title}
                            className="landing-product-metric rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                            style={{ animationDelay: `${260 + index * 90}ms` }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F5132] text-xs font-black text-white">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-black text-slate-950">
                                        {title}
                                    </p>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </article>

            <article
                className="min-w-[88%] snap-start xl:min-w-0 landing-stat-card overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-6"
                style={{ animationDelay: "130ms" }}
            >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    Espace résident
                </p>
                <h3 className="mt-2 text-xl font-black text-[#0F5132]">
                    Le résident consulte et agit
                </h3>

                <div className="mt-5 flex items-center gap-3 border-b border-emerald-100 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-[#0F5132]">
                        JM
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">
                            Julia Martin
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                            Lot A-12 · Copropriétaire
                        </p>
                    </div>
                </div>

                <div className="grid divide-y divide-emerald-100">
                    {residentActions.map(([title, description], index) => (
                        <div
                            key={title}
                            className="landing-resident-row py-3"
                            style={{ animationDelay: `${360 + index * 110}ms` }}
                        >
                            <p className="text-sm font-black text-[#0F5132]">
                                {title}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>

                <div
                    className="landing-resident-row mt-4 w-full rounded-full bg-[#0F5132] px-4 py-3 text-center text-sm font-black text-white shadow-sm"
                    style={{ animationDelay: "760ms" }}
                >
                    Accéder à son espace
                </div>
            </article>

            <article
                className="min-w-[88%] snap-start xl:min-w-0 landing-stat-card overflow-hidden rounded-2xl border border-emerald-100 bg-[#0F5132] p-5 text-white shadow-sm sm:rounded-[2rem] sm:p-6"
                style={{ animationDelay: "260ms" }}
            >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C9A227]">
                    Automatisation
                </p>
                <h3 className="mt-2 text-xl font-black">
                    SyndiCare relie les actions
                </h3>

                <div className="mt-5 grid gap-3">
                    {flowSteps.map(([title, description], index) => (
                        <div
                            key={title}
                            className="landing-flow-step flex gap-3"
                            style={{ animationDelay: `${420 + index * 130}ms` }}
                        >
                            <div className="flex flex-col items-center">
                                <span
                                    className="landing-flow-pulse flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black text-[#0F5132]"
                                    style={{
                                        animationDelay: `${index * 180}ms`,
                                    }}
                                >
                                    {index + 1}
                                </span>
                                {index < flowSteps.length - 1 && (
                                    <span className="h-full w-px bg-white/20" />
                                )}
                            </div>
                            <div className="pb-4">
                                <p className="text-sm font-black">{title}</p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-emerald-50/75">
                                    {description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </article>
        </div>
    );
}

function WorkflowStatsPreview() {
    const { ref, isVisible, playKey } = useReplayInView();
    const hasAutoHintedRef = useRef(false);

    useEffect(() => {
        if (
            !isVisible ||
            hasAutoHintedRef.current ||
            typeof window === "undefined" ||
            window.innerWidth >= 1024 ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const container = ref.current;

        if (!container) {
            return;
        }

        hasAutoHintedRef.current = true;

        const direction = document.documentElement.dir === "rtl" ? -1 : 1;

        const timer = window.setTimeout(() => {
            container.scrollBy({
                left: 75 * direction,
                behavior: "smooth",
            });

            window.setTimeout(() => {
                container.scrollTo({
                    left: 0,
                    behavior: "smooth",
                });
            }, 650);
        }, 900);

        return () => window.clearTimeout(timer);
    }, [isVisible, ref]);
    const workflowSteps = [
        {
            title: "Le syndic prépare",
            description:
                "Immeubles, lots, résidents, documents et appels de charges sont structurés avant diffusion.",
            stat: "12 lots",
            label: "prêts à facturer",
        },
        {
            title: "Les résidents consultent",
            description:
                "Chaque utilisateur retrouve uniquement les informations liées à son lot et à son rôle.",
            stat: "32 vues",
            label: "sur les annonces",
        },
        {
            title: "Les paiements sont validés",
            description:
                "Les preuves sont contrôlées par le syndic, puis les soldes et statistiques se mettent à jour.",
            stat: "23",
            label: "paiements à valider",
        },
        {
            title: "Tout est historisé",
            description:
                "Notifications, tickets, documents et changements de statut restent traçables dans le temps.",
            stat: "Historique",
            label: "actions tracées",
        },
    ];

    return (
        <></>
        // <section ref={ref} className={`landing-replay-section border-y border-emerald-950/10 bg-white ${isVisible ? 'is-visible' : ''}`}>
        //     <div className="mx-auto max-w-[112rem] px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        //         <div className="max-w-4xl">
        //             <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
        //                 Processus
        //             </p>
        //             <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl lg:text-4xl">
        //                 De l’appel de charge à la notification, tout reste traçable.
        //             </h2>
        //             <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
        //                 SyndiCare transforme les opérations du syndic en un flux clair: préparation, consultation, validation et historique.
        //             </p>
        //         </div>

        //         <div className="mt-9 grid gap-4 lg:grid-cols-4">
        //             {workflowSteps.map((step, index) => (
        //                 <article
        //                     key={step.title}
        //                     className="landing-stat-card landing-animated-stat relative overflow-hidden rounded-2xl border border-emerald-100 bg-[#f8faf8] p-5 shadow-sm"
        //                     style={{ animationDelay: `${index * 110}ms` }}
        //                 >
        //                     <div className="flex items-start justify-between gap-4">
        //                         <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F5132] text-sm font-black text-white">
        //                             {index + 1}
        //                         </span>
        //                     </div>

        //                     <h3 className="mt-5 text-lg font-black text-[#0F5132]">
        //                         {step.title}
        //                     </h3>
        //                     <p className="mt-2 min-h-[5rem] text-sm leading-6 text-slate-600">
        //                         {step.description}
        //                     </p>

        //                     <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        //                         <p className="text-2xl font-black text-[#0F5132]">
        //                             <AnimatedMetricValue
        //                                 value={step.stat}
        //                                 playKey={playKey}
        //                                 isActive={isVisible}
        //                                 delay={220 + index * 110}
        //                             />
        //                         </p>
        //                         <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        //                             {step.label}
        //                         </p>
        //                     </div>
        //                 </article>
        //             ))}
        //         </div>

        //         <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        //             <p className="rounded-2xl border border-emerald-100 bg-[#f8faf8] p-5 text-sm font-semibold leading-6 text-slate-600">
        //                 Chaque étape alimente les statistiques, les notifications et l’historique. Le syndic sait ce qui est fait, ce qui reste à traiter, et qui a été informé.
        //             </p>
        //             <div className="rounded-2xl bg-[#0F5132] p-5 text-white shadow-sm lg:w-80">
        //                 <p className="text-3xl font-black">4 étapes</p>
        //                 <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/75">
        //                     Un circuit clair pour éviter les suivis dispersés.
        //                 </p>
        //             </div>
        //         </div>
        //     </div>
        // </section>
    );
}

function SyndicDashboardPreview({ features }) {
    const { ref, isVisible, playKey } = useReplayInView();
    const hasAutoHintedRef = useRef(false);

    useEffect(() => {
        if (
            !isVisible ||
            hasAutoHintedRef.current ||
            typeof window === "undefined" ||
            window.innerWidth >= 1024 ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }

        const container = ref.current;

        if (!container) {
            return;
        }

        let backTimer;
        let restoreTimer;

        const timer = window.setTimeout(() => {
            hasAutoHintedRef.current = true;

            const direction = document.documentElement.dir === "rtl" ? -1 : 1;

            container.style.scrollSnapType = "none";

            container.scrollBy({
                left: 90 * direction,
                behavior: "smooth",
            });

            backTimer = window.setTimeout(() => {
                container.scrollTo({
                    left: 0,
                    behavior: "smooth",
                });

                restoreTimer = window.setTimeout(() => {
                    container.style.scrollSnapType = "";
                }, 500);
            }, 650);
        }, 800);

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(backTimer);
            window.clearTimeout(restoreTimer);
            container.style.scrollSnapType = "";
        };
    }, [isVisible, ref]);
    return (
        <section
            ref={ref}
            className={`landing-dashboard-replay mx-auto flex w-full max-w-[112rem] snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 sm:py-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:overflow-visible lg:px-10 lg:py-16 ${isVisible ? "is-visible" : ""}`}
        >
            <div className="w-[88%] shrink-0 snap-start px-4 lg:w-auto lg:min-w-0 lg:px-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                    Pour le syndic
                </p>
                <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl lg:text-4xl">
                    Un tableau de bord pour gérer le parc immobilier.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                    Le syndic garde une vision claire des opérations importantes
                    et réduit les suivis dispersés entre Excel, messages et
                    dossiers locaux.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {features
                        .slice(0, 4)
                        .map(([featureTitle, featureDescription]) => (
                            <article
                                key={featureTitle}
                                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                            >
                                <span className="block h-1.5 w-8 rounded-full bg-[#C9A227]" />
                                <h3 className="mt-3 text-sm font-black text-slate-950">
                                    {featureTitle}
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                    {featureDescription}
                                </p>
                            </article>
                        ))}
                </div>
            </div>
            <div className="relative w-[88%] shrink-0 snap-start px-4 lg:w-auto lg:min-w-0 lg:px-0">
                <div className="landing-dashboard-preview h-full overflow-hidden rounded-3xl border border-emerald-100 bg-white p-4 shadow-2xl shadow-emerald-950/10 sm:p-5">
                    <div className="flex flex-col gap-3 border-b border-emerald-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                                Vue globale
                            </p>
                            <h3 className="mt-1 text-xl font-black text-[#0F5132] sm:text-2xl">
                                Tableau de bord SyndiCare
                            </h3>
                        </div>
                        <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 p-1 text-xs font-black text-emerald-950">
                            <span className="rounded-full bg-[#0F5132] px-3 py-1.5 text-white">
                                Juin
                            </span>
                            <span className="px-3 py-1.5">2026</span>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboardPreviewStats.map((stat, index) => (
                            <AnimatedStat
                                key={stat.label}
                                stat={stat}
                                index={index}
                                playKey={playKey}
                                isActive={isVisible}
                            />
                        ))}
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        <div className="hidden rounded-2xl border border-emerald-100 bg-[#f8faf8] p-4 sm:block">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-black text-[#0F5132]">
                                        Revenus encaissés
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                        Évolution des paiements validés
                                    </p>
                                </div>
                                <p className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-900 shadow-sm">
                                    +18%
                                </p>
                            </div>

                            <svg
                                key={`landing-revenue-${playKey}`}
                                viewBox="0 0 420 160"
                                className="mt-4 h-44 w-full overflow-visible"
                                role="img"
                                aria-label="Courbe de revenus de démonstration"
                            >
                                <defs>
                                    <linearGradient
                                        id="landingRevenueFill"
                                        x1="0"
                                        x2="0"
                                        y1="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#10b981"
                                            stopOpacity="0.24"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#10b981"
                                            stopOpacity="0.02"
                                        />
                                    </linearGradient>
                                </defs>
                                {[30, 70, 110, 150].map((y) => (
                                    <line
                                        key={y}
                                        x1="0"
                                        x2="420"
                                        y1={y}
                                        y2={y}
                                        stroke="#d9eee3"
                                        strokeWidth="1"
                                    />
                                ))}
                                <path
                                    d="M12 132 C58 116 72 94 112 102 C158 111 166 64 214 72 C256 79 268 38 314 46 C356 53 370 28 408 24 L408 150 L12 150 Z"
                                    fill="url(#landingRevenueFill)"
                                />
                                <path
                                    className="landing-chart-line"
                                    d="M12 132 C58 116 72 94 112 102 C158 111 166 64 214 72 C256 79 268 38 314 46 C356 53 370 28 408 24"
                                    fill="none"
                                    stroke="#0F5132"
                                    strokeLinecap="round"
                                    strokeWidth="7"
                                />
                                {[12, 112, 214, 314, 408].map((x, index) => {
                                    const yValues = [132, 102, 72, 46, 24];

                                    return (
                                        <circle
                                            key={x}
                                            className="landing-chart-dot"
                                            cx={x}
                                            cy={yValues[index]}
                                            r="6"
                                            fill="#C9A227"
                                            stroke="white"
                                            strokeWidth="4"
                                            style={{
                                                animationDelay: `${700 + index * 120}ms`,
                                            }}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                        <div className="hidden xl:grid xl:gap-4">
                            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-black text-rose-950">
                                        Charges impayées
                                    </p>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-rose-700">
                                        3 lots
                                    </span>
                                </div>
                                <div className="mt-3 grid gap-2">
                                    {dashboardPreviewCharges.map(
                                        ([lot, amount]) => (
                                            <div
                                                key={lot}
                                                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                                            >
                                                <span className="font-bold text-slate-700">
                                                    {lot}
                                                </span>
                                                <span className="font-black text-rose-700">
                                                    {amount}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-sm font-black text-[#0F5132]">
                                    Derniers tickets
                                </p>
                                <div className="mt-3 grid gap-2">
                                    {dashboardPreviewTickets.map(
                                        ([resident, problem, status]) => (
                                            <div
                                                key={problem}
                                                className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="truncate text-sm font-black text-slate-900">
                                                        {resident}
                                                    </p>
                                                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                                        {status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                                                    {problem}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LandingIntro() {
    const letters = "SyndiCare".split("");

    return (
        <div
            className="landing-intro fixed inset-0 z-[90] flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0B2F1F] px-5 py-8 text-white"
            role="status"
            aria-label="Chargement de SyndiCare"
        >
            <div className="landing-intro-content relative z-10 flex flex-col items-center">
                <div className="landing-intro-logo-shell flex h-32 w-32 items-center justify-center rounded-full border border-[#C9A227]/35 bg-white/8 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.34)] sm:h-44 sm:w-44">
                    <div className="landing-intro-logo flex h-full w-full items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(15,60,29,0.08)]">
                        <img
                            src="/images/logo.png"
                            alt=""
                            className="h-24 w-24 object-contain sm:h-36 sm:w-36"
                        />
                    </div>
                </div>

                <div
                    className="landing-intro-word mt-7 flex max-w-full flex-wrap items-center justify-center gap-0.5 text-4xl font-black text-white sm:mt-8 sm:gap-1 sm:text-7xl"
                    aria-hidden="true"
                >
                    {letters.map((letter, index) => (
                        <span
                            key={`${letter}-${index}`}
                            className="landing-intro-letter inline-block"
                            style={{ animationDelay: `${620 + index * 125}ms` }}
                        >
                            {letter}
                        </span>
                    ))}
                </div>
                <span className="sr-only">SyndiCare</span>

                <div className="landing-intro-tagline mt-4 flex items-center gap-3 text-xs font-bold uppercase text-emerald-50/75 sm:gap-4 sm:text-sm">
                    <span className="h-px w-8 bg-[#C9A227]/80 sm:w-12" />
                    <span>Gestion syndic</span>
                    <span className="h-px w-8 bg-[#C9A227]/80 sm:w-12" />
                </div>

                <div className="mt-7 h-1.5 w-48 overflow-hidden rounded-full bg-white/15 sm:w-64">
                    <div className="landing-intro-progress h-full rounded-full bg-[#C9A227]" />
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ auth }) {
    const { locale } = useI18n();
    const [showIntro, setShowIntro] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return window.sessionStorage.getItem(INTRO_STORAGE_KEY) !== "1";
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [lots, setLots] = useState(45);
    const [billing, setBilling] = useState("monthly");
    const updateLots = (value) => setLots(normalizeLots(value));
    const pricingDétails = pricingDétailsForLots(lots);
    const monthlyPrice =
        billing === "annual"
            ? pricingDétails.monthlyBase * 0.9
            : pricingDétails.monthlyBase;
    const annualPrice = monthlyPrice * 12;
    const sliderProgress = ((lots - LOT_MIN) / (LOT_MAX - LOT_MIN)) * 100;

    const destination = auth?.user ? route("dashboard") : route("login");
    const currentYear = new Date().getFullYear();
    const isArabic = locale === "ar";
    const localizedDesktopShot = isArabic ? arabicDesktopShot : desktopShot;
    const localizedMobileShot = isArabic ? arabicMobileShot : mobileShot;
    const localizedBlogImage = (post) => blogImageForLocale(post, locale);

    useEffect(() => {
        if (!showIntro) {
            return undefined;
        }

        const hideIntro = window.setTimeout(() => {
            window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
            setShowIntro(false);
        }, INTRO_DURATION_MS);

        return () => window.clearTimeout(hideIntro);
    }, [showIntro]);

    return (
        <>
            <Head title="SyndiCare - Gestion syndic" />

            {showIntro && <LandingIntro />}

            <div className="min-h-screen w-full overflow-x-hidden bg-[#f8faf8] text-slate-900">
                <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-[#f8faf8]/95 backdrop-blur">
                    <div className="mx-auto flex min-h-16 w-full max-w-[112rem] items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6 lg:px-10">
                        <a href="#accueil" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="Logo SyndiCare"
                                className="h-10 w-10 object-contain sm:h-14 sm:w-14"
                            />
                            <div>
                                <p className="text-base font-black text-[#0F5132] sm:text-xl">
                                    SyndiCare
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800 sm:text-[10px] sm:tracking-[0.22em]">
                                    Gestion syndic
                                </p>
                            </div>
                        </a>

                        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
                            {landingNavLinks.map(([href, label]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="transition hover:text-[#0F5132]"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block">
                                <LanguageSwitcher compact />
                            </div>
                            <Link
                                href={destination}
                                className="inline-flex rounded-full border border-emerald-900/15 bg-white px-3 py-2 text-xs font-black text-[#0F5132] shadow-sm transition hover:bg-emerald-50 sm:hidden"
                            >
                                {auth?.user ? "Dashboard" : "Connexion"}
                            </Link>
                            <Link
                                href={destination}
                                className="hidden rounded-full border border-emerald-900/15 bg-white px-4 py-2 text-sm font-bold text-[#0F5132] shadow-sm transition hover:bg-emerald-50 sm:inline-flex"
                            >
                                {auth?.user ? "Tableau de bord" : "Connexion"}
                            </Link>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileMenuOpen((current) => !current)
                                }
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="landing-mobile-menu"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/15 bg-white text-[#0F5132] shadow-sm transition hover:bg-emerald-50 lg:hidden"
                            >
                                <span className="sr-only">Menu</span>
                                <span className="grid gap-1">
                                    <span
                                        className={`block h-0.5 w-4 rounded-full bg-current transition ${isMobileMenuOpen ? "translate-y-1.5 rotate-45" : ""}`}
                                    />
                                    <span
                                        className={`block h-0.5 w-4 rounded-full bg-current transition ${isMobileMenuOpen ? "opacity-0" : ""}`}
                                    />
                                    <span
                                        className={`block h-0.5 w-4 rounded-full bg-current transition ${isMobileMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
                                    />
                                </span>
                            </button>
                        </div>
                    </div>

                    {isMobileMenuOpen && (
                        <nav
                            id="landing-mobile-menu"
                            className="border-t border-emerald-950/10 bg-white px-4 py-4 shadow-xl shadow-emerald-950/5 lg:hidden"
                        >
                            <div className="grid gap-2">
                                {landingNavLinks.map(([href, label]) => (
                                    <a
                                        key={href}
                                        href={href}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className="rounded-2xl px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-emerald-50 hover:text-[#0F5132]"
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>
                            <div className="mt-4 grid gap-3 border-t border-emerald-100 pt-4 sm:grid-cols-2">
                                <a
                                    href={WHATSAPP_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
                                >
                                    <WhatsAppMark className="h-5 w-5" />
                                    Demander une démo
                                </a>
                                <div className="flex justify-center sm:justify-end">
                                    <LanguageSwitcher compact />
                                </div>
                            </div>
                        </nav>
                    )}
                </header>

                <main id="accueil">
                    <section
                        className="relative overflow-hidden bg-[#132018] sm:min-h-[calc(100svh-4.5rem)]"
                        style={{
                            backgroundImage: `linear-gradient(90deg, rgba(8, 26, 18, 0.86) 0%, rgba(10, 28, 21, 0.64) 46%, rgba(15, 23, 42, 0.18) 100%), url(${heroImage})`,
                            backgroundPosition: "center top",
                            backgroundSize: "cover",
                        }}
                    >
                        <div className="mx-auto grid w-full min-w-0 max-w-[112rem] content-center gap-7 px-4 py-8 sm:min-h-[calc(100svh-4.5rem)] sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-10 lg:px-10">
                            <div className="relative z-10 min-w-0 max-w-full">
                                <div className="relative pl-5">
                                    {/* Ligne décorative */}
                                    <span className="absolute left-0 top-1 h-[46px] w-px bg-gradient-to-b from-emerald-100 via-white/40 to-[#C9A227]" />

                                    <div className="flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 rotate-45 bg-emerald-100" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-50 sm:text-xs">
                                            Solution pour syndics au Maroc
                                        </p>
                                    </div>

                                    <div className="mt-2.5 flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
                                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E9D98D] sm:text-xs">
                                            Pensée pour la loi 18-00
                                        </p>
                                    </div>
                                </div>

                                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.06] text-white sm:text-5xl lg:text-6xl">
                                    Une plateforme claire pour piloter{" "}
                                    <span className="text-[#C9A227]">
                                        votre syndic.
                                    </span>
                                </h1>
                                <p className="mt-5 hidden max-w-xl text-base leading-7 text-emerald-50/80 sm:mt-6 sm:block sm:text-lg sm:leading-8">
                                    SyndiCare rassemble charges, paiements,
                                    documents, annonces, réclamations et
                                    résidents dans une interface simple à suivre
                                    au quotidien.
                                </p>

                                <div className="mt-7 flex max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row">
                                    <Link
                                        href={route("login")}
                                        className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-[#0F5132] shadow-lg shadow-slate-950/20 transition hover:bg-emerald-50"
                                    >
                                        Tester la démo
                                    </Link>
                                    <a
                                        href="#produit"
                                        className="inline-flex justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-white/20"
                                    >
                                        Voir le produit
                                    </a>
                                </div>

                                <div className="mt-7 grid w-full max-w-lg grid-cols-3 gap-2 sm:mt-8 sm:max-w-xl sm:gap-3">
                                    {[
                                        ["+10", "modules métier"],
                                        ["24h", "suivi continu"],
                                        ["100%", "interface responsive"],
                                    ].map(([value, label]) => (
                                        <div
                                            key={label}
                                            className="min-w-0 rounded-2xl border border-white/20 bg-white/10 p-2.5 shadow-sm backdrop-blur sm:p-4"
                                        >
                                            <p className="text-xl font-black text-white sm:text-2xl">
                                                {value}
                                            </p>
                                            <p className="mt-1 break-words text-[10px] font-semibold leading-4 text-emerald-50/75 sm:text-xs">
                                                {label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative hidden min-w-0 w-full max-w-[760px] justify-self-center sm:block lg:justify-self-end">
                                <div className="rounded-2xl border border-white bg-white/80 p-2 shadow-2xl shadow-slate-950/10 sm:rounded-[2rem] sm:p-3">
                                    <img
                                        src={localizedDesktopShot}
                                        alt="Aperçu du tableau de bord SyndiCare"
                                        className="aspect-[16/10] w-full rounded-xl object-cover object-left-top sm:rounded-[1.5rem]"
                                    />
                                </div>

                                <div className="absolute -bottom-6 right-3 hidden w-32 rounded-[1.4rem] border border-white bg-white p-2 shadow-2xl shadow-slate-950/10 sm:block lg:w-40 xl:w-44">
                                    <img
                                        src={localizedMobileShot}
                                        alt="Aperçu mobile SyndiCare"
                                        className="rounded-[1.2rem]"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <EcosystemMarquee />

                    <section
                        id="produit"
                        className="border-y border-emerald-950/10 bg-white py-12 sm:py-14 lg:py-16"
                    >
                        <div className="mx-auto max-w-[112rem] px-4 sm:px-6 lg:px-10">
                            <div className="max-w-3xl">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                    Vue produit
                                </p>
                                <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl lg:text-4xl">
                                    Une gestion connectée entre le syndic, les
                                    lots et les résidents.
                                </h2>
                            </div>

                            <ProductExperiencePreview />
                        </div>
                    </section>

                    <WorkflowStatsPreview />

                    <div id="fonctionnalites">
                        <SyndicDashboardPreview features={syndicFeatures} />
                    </div>

                    <section
                        id="tarifs"
                        className="mx-auto max-w-[112rem] px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16"
                    >
                        <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-8">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                    Tarification
                                </p>
                                <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl lg:text-4xl">
                                    Estimez votre abonnement selon le nombre de
                                    lots.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Ajustez le volume géré et choisissez le mode
                                    de facturation. Le simulateur donne une
                                    estimation simple pour préparer votre offre.
                                </p>

                                <div className="mt-6 hidden gap-3 lg:grid">
                                    {[
                                        [
                                            "Portefeuille léger",
                                            "Moins de 20 lots",
                                            "100 Dh / mois",
                                        ],
                                        [
                                            "Portefeuille standard",
                                            "20 à 100 lots",
                                            "4,7 Dh / lot",
                                        ],
                                        [
                                            "Portefeuille étendu",
                                            "Plus de 100 lots",
                                            "4,5 Dh / lot",
                                        ],
                                    ].map(([name, range, price]) => (
                                        <div
                                            key={name}
                                            className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                                        >
                                            <p className="font-bold text-slate-950">
                                                {name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {range}
                                            </p>
                                            <p className="mt-2 text-sm font-black text-[#0F5132]">
                                                {price}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white bg-white p-4 shadow-xl shadow-emerald-950/10 sm:rounded-[2rem] sm:p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">
                                            Nombre total de lots
                                        </p>
                                        <p className="mt-1 text-3xl font-black text-[#0F5132] sm:text-4xl">
                                            {lots}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 rounded-full bg-emerald-50 p-1 sm:flex">
                                        {[
                                            ["monthly", "Mensuel"],
                                            ["annual", "Annuel -10%"],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() =>
                                                    setBilling(value)
                                                }
                                                className={`rounded-full px-3 py-2 text-sm font-bold transition sm:px-4 ${
                                                    billing === value
                                                        ? "bg-[#0F5132] text-white"
                                                        : "text-emerald-900"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-emerald-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <label
                                        htmlFor="pricing-lots"
                                        className="text-sm font-bold text-emerald-950"
                                    >
                                        Lots
                                    </label>
                                    <div className="grid grid-cols-[2.75rem_7rem_2.75rem] items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateLots(lots - 1)}
                                            disabled={lots <= LOT_MIN}
                                            aria-label="Retirer un lot"
                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white text-xl font-black text-[#0F5132] shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            -
                                        </button>
                                        <input
                                            id="pricing-lots"
                                            type="number"
                                            min={LOT_MIN}
                                            max={LOT_MAX}
                                            step="1"
                                            value={lots}
                                            onInput={(event) =>
                                                updateLots(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            onChange={(event) =>
                                                updateLots(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border-emerald-200 text-center text-base font-black text-[#0F5132] focus:border-[#0F5132] focus:ring-[#0F5132]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateLots(lots + 1)}
                                            disabled={lots >= LOT_MAX}
                                            aria-label="Ajouter un lot"
                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white text-xl font-black text-[#0F5132] shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min={LOT_MIN}
                                    max={LOT_MAX}
                                    step="1"
                                    value={lots}
                                    aria-label="Nombre total de lots"
                                    onInput={(event) =>
                                        updateLots(event.currentTarget.value)
                                    }
                                    onChange={(event) =>
                                        updateLots(event.currentTarget.value)
                                    }
                                    className="mt-6 h-2 w-full cursor-pointer rounded-full accent-[#0F5132]"
                                    style={{
                                        background: `linear-gradient(to right, #0F5132 ${sliderProgress}%, #d1fae5 ${sliderProgress}%)`,
                                    }}
                                />
                                <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                                    <span>1 lot</span>
                                    <span>1000 lots</span>
                                </div>

                                <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                                    {PRICING_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => updateLots(preset)}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                                                lots === preset
                                                    ? "border-[#0F5132] bg-[#0F5132] text-white"
                                                    : "border-emerald-200 bg-emerald-50 text-[#0F5132] hover:bg-emerald-100"
                                            }`}
                                        >
                                            {preset} lots
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-7 rounded-2xl bg-[#0F5132] p-4 text-white sm:mt-8 sm:rounded-[1.5rem] sm:p-6">
                                    <p className="text-sm font-semibold text-emerald-100">
                                        Total estimé
                                    </p>
                                    <p
                                        key={monthlyPrice}
                                        className="mt-2 text-3xl font-black sm:text-5xl"
                                    >
                                        {formatPrice(monthlyPrice)}
                                    </p>
                                    <p className="mt-2 text-sm text-emerald-50/75">
                                        par mois{" "}
                                        {billing === "annual"
                                            ? "avec facturation annuelle"
                                            : "en facturation mensuelle"}
                                    </p>
                                    <div className="mt-5 grid gap-2 text-sm font-semibold text-emerald-50/90 sm:grid-cols-2">
                                        <p className="rounded-xl bg-white/10 px-3 py-2">
                                            Tarif: {pricingDétails.rateLabel}
                                        </p>
                                        <p className="rounded-xl bg-white/10 px-3 py-2">
                                            Calcul: {pricingDétails.calculation}
                                        </p>
                                    </div>
                                    {billing === "annual" && (
                                        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-50/90">
                                            Total annuel estimé:{" "}
                                            {formatPrice(annualPrice)}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                                    {[
                                        "Multi-immeubles",
                                        "Résidents illimités",
                                        "Support et assistance",
                                        "Mises à jour incluses",
                                    ].map((item) => (
                                        <p
                                            key={item}
                                            className="rounded-xl bg-emerald-50 px-3 py-2"
                                        >
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <details className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm lg:hidden">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black text-[#0F5132]">
                                    <span>Voir la grille tarifaire</span>
                                    <span className="text-lg">+</span>
                                </summary>

                                <div className="mt-4 grid gap-3">
                                    {[
                                        [
                                            "Portefeuille léger",
                                            "Moins de 20 lots",
                                            "100 Dh / mois",
                                        ],
                                        [
                                            "Portefeuille standard",
                                            "20 à 100 lots",
                                            "4,7 Dh / lot",
                                        ],
                                        [
                                            "Portefeuille étendu",
                                            "Plus de 100 lots",
                                            "4,5 Dh / lot",
                                        ],
                                    ].map(([name, range, price]) => (
                                        <div
                                            key={name}
                                            className="rounded-xl bg-emerald-50 p-3"
                                        >
                                            <p className="font-bold text-slate-950">
                                                {name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {range}
                                            </p>

                                            <p className="mt-1 text-sm font-black text-[#0F5132]">
                                                {price}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </div>
                    </section>
                    <BlogSection localizedBlogImage={localizedBlogImage} />
                    <div className="grid bg-[#f8faf8] lg:grid-cols-2 lg:items-start">
                        <section
                            id="faq"
                            className="border-y border-emerald-950/10 bg-[#f8faf8]"
                        >
                            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                        FAQ
                                    </p>
                                    <h2 className="mt-3 text-2xl font-black text-[#0F5132] sm:text-3xl lg:text-4xl">
                                        Questions fréquentes
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                                        Les réponses essentielles avant de
                                        présenter SyndiCare à votre équipe ou à
                                        vos résidents.
                                    </p>

                                    <div className="mt-8 space-y-3">
                                        {faqs.map(([question, answer]) => (
                                            <details
                                                key={question}
                                                className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
                                            >
                                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-slate-950">
                                                    <span>{question}</span>
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-black text-[#0F5132] transition group-open:rotate-45">
                                                        +
                                                    </span>
                                                </summary>
                                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                                    {answer}
                                                </p>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <ContactSection />
                    </div>
                </main>

                <footer className="border-t border-emerald-950/10 bg-[#0F5132] text-white">
                    <div className="mx-auto grid max-w-[112rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:px-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo SyndiCare"
                                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                                />
                                <p className="text-2xl font-black">SyndiCare</p>
                            </div>
                            <p className="mt-3 max-w-md text-sm leading-6 text-emerald-50/75">
                                Plateforme de gestion pour syndics: finances,
                                réclamations, documents, annonces et suivi
                                résident.
                            </p>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Produit</p>
                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <a href="#produit">Aperçu</a>
                                <a href="#fonctionnalites">Fonctionnalités</a>
                                <a href="#tarifs">Tarifs</a>
                                <a href="#faq">FAQ</a>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Accès</p>
                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <Link href={route("login")}>Connexion</Link>
                                <Link href={route("register")}>
                                    Inscription
                                </Link>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Informations légales</p>

                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <Link href="/mentions-legales">
                                    Mentions légales
                                </Link>

                                <Link href="/confidentialite">
                                    Politique de confidentialité
                                </Link>

                                <Link href="/conditions-utilisation">
                                    Conditions d’utilisation
                                </Link>

                                <Link href="/cookies">
                                    Politique de cookies
                                </Link>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Contact</p>
                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="inline-flex items-center gap-2"
                                >
                                    <GmailMark className="h-4 w-4 shrink-0" />
                                    <span>{CONTACT_EMAIL}</span>
                                </a>
                                <a
                                    href={WHATSAPP_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2"
                                >
                                    <WhatsAppMark className="h-4 w-4 shrink-0" />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 px-4 py-4 text-center text-xs font-semibold text-emerald-50/70">
                        © {currentYear} SyndiCare. Tous droits réservés.
                    </div>
                </footer>
            </div>
        </>
    );
}
