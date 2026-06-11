import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { blogImageForLocale, blogPosts } from './Blog/articles';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nProvider';

const desktopShot = '/images/Screenshot%202026-05-15%20155304.png';
const financeShot = '/images/Screenshot%202026-05-15%20155345.png';
const documentsShot = '/images/Screenshot%202026-05-15%20155452.png';
const mobileShot = '/images/Screenshot%202026-05-15%20192635.png';
const heroImage = '/images/hero.jpg';
const loginShot = '/images/desktoplogin.png';
const flyerShot = '/images/flyer.png';
const arabicDesktopShot = '/images/dashboardarabe.png';
const arabicFinanceShot = '/images/dashboard%20arabe%202png.png';
const arabicDocumentsShot = '/images/declarer%20objet%20arab.png';
const arabicMobileShot = '/images/dashboard%20mobile%20arab.png';
const arabicLoginShot = '/images/arablogin.png';
const LOT_MIN = 1;
const LOT_MAX = 1000;
const PRICING_PRESETS = [10, 45, 100, 200, 500];
const CONTACT_EMAIL = 'syndicaremanager@gmail.com';
const WHATSAPP_URL = 'https://wa.me/212663442169';

const syndicFeatures = [
    ['Gestion des lots', 'Suivez les lots, résidents, immeubles et étages depuis un seul espace.'],
    ['Suivi financier', 'Contrôlez les charges, paiements, dépenses et reçus en temps réel.'],
    ['Documents ciblés', 'Partagez les documents par rôle, immeuble, lot ou pour tous.'],
    ['Réclamations', 'Centralisez les tickets et gardez un historique clair des échanges.'],
    ['Annonces', 'Diffusez les informations importantes aux résidents concernés.'],
    ['Objets perdus', 'Facilitez la déclaration et le rapprochement des objets retrouvés.'],
];

const residentFeatures = [
    ['Espace personnel', 'Chaque résident consulte ses informations et ses paiements.'],
    ['Tickets suivis', 'Les réclamations restent visibles avec un fil de discussion.'],
    ['Alertes utiles', 'Les résidents reçoivent les annonces et les notifications importantes.'],
    ['Documents accessibles', 'Les fichiers utiles restent disponibles selon le rôle et le logement.'],
    ['Français et Arabe', "L'application s'adapte à la langue du résident."],
    ['Rappels mensuels', 'Des rappels aident à ne pas oublier les paiements.'],
    ['Connexion simple par SMS', 'Les résidents se connectent facilement avec un mot de passe.'],
];

const faqs = [
    [
        'Est-ce que SyndiCare gère plusieurs immeubles ?',
        'Oui. Le syndic peut organiser les immeubles, les étages, les lots et les résidents depuis le même espace.',
    ],
    [
        'Les locataires et copropriétaires voient-ils les mêmes données ?',
        'Non. Les permissions et le filtrage permettent de montrer seulement les informations qui concernent chaque utilisateur.',
    ],
    [
        'Peut-on suivre les réclamations ?',
        'Oui. Chaque ticket peut contenir un suivi avec les réponses du syndic et du résident.',
    ],
    [
        'Le simulateur de tarif est-il automatique ?',
        'Oui. Le montant estimé change selon le nombre de lots et le mode de facturation choisi.',
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

function pricingDetailsForLots(lots) {
    if (lots < 20) {
        return {
            monthlyBase: 100,
            rateLabel: 'Forfait minimum',
            calculation: '100 Dh / mois jusqu a 19 lots',
        };
    }

    const rate = lots <= 100 ? 4.7 : 4.5;

    return {
        monthlyBase: priceForLots(lots),
        rateLabel: `${rate.toLocaleString('fr-FR')} Dh / lot`,
        calculation: `${lots} lots x ${rate.toLocaleString('fr-FR')} Dh`,
    };
}

function formatPrice(value) {
    return `${Math.round(value).toLocaleString('fr-FR')} Dh`;
}

function normalizeLots(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return LOT_MIN;
    }

    return Math.min(LOT_MAX, Math.max(LOT_MIN, Math.round(parsed)));
}

function FeatureList({ eyebrow, title, description, features }) {
    return (
        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                    {eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b3516] sm:text-4xl">
                    {title}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                    {description}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {features.map(([featureTitle, featureDescription]) => (
                    <article
                        key={featureTitle}
                        className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                    >
                        <span className="block h-2 w-10 rounded-full bg-[#d4af37]" />
                        <h3 className="mt-4 text-lg font-bold text-slate-950">
                            {featureTitle}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {featureDescription}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Welcome({ auth }) {
    const { locale } = useI18n();
    const [lots, setLots] = useState(45);
    const [billing, setBilling] = useState('monthly');
    const updateLots = (value) => setLots(normalizeLots(value));
    const pricingDetails = pricingDetailsForLots(lots);
    const monthlyPrice = billing === 'annual'
        ? pricingDetails.monthlyBase * 0.9
        : pricingDetails.monthlyBase;
    const annualPrice = monthlyPrice * 12;
    const sliderProgress = ((lots - LOT_MIN) / (LOT_MAX - LOT_MIN)) * 100;

    const destination = auth?.user ? route('dashboard') : route('login');
    const currentYear = new Date().getFullYear();
    const isArabic = locale === 'ar';
    const localizedDesktopShot = isArabic ? arabicDesktopShot : desktopShot;
    const localizedFinanceShot = isArabic ? arabicFinanceShot : financeShot;
    const localizedDocumentsShot = isArabic ? arabicDocumentsShot : documentsShot;
    const localizedMobileShot = isArabic ? arabicMobileShot : mobileShot;
    const localizedLoginShot = isArabic ? arabicLoginShot : loginShot;
    const localizedBlogImage = (post) => blogImageForLocale(post, locale);

    return (
        <>
            <Head title="SyndiCare - Gestion syndic" />

            <div className="min-h-screen w-screen max-w-[100vw] overflow-x-hidden bg-[#f6f2e9] text-slate-900">
                <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-[#f6f2e9]/95 backdrop-blur">
                    <div className="mx-auto flex h-20 w-screen max-w-[100vw] items-center justify-between gap-3 overflow-hidden px-4 sm:max-w-7xl sm:gap-4 sm:px-6 lg:px-8">
                        <a href="#accueil" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="Logo SyndiCare"
                                className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                            />
                            <div>
                                <p className="text-lg font-black text-[#0b3516] sm:text-xl">
                                    SyndiCare
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800 sm:text-[10px] sm:tracking-[0.22em]">
                                    Gestion syndic
                                </p>
                            </div>
                        </a>

                        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">
                            <a href="#produit" className="hover:text-[#0b3516]">
                                Produit
                            </a>
                            <a href="#fonctionnalites" className="hover:text-[#0b3516]">
                                Fonctionnalités
                            </a>
                            <a href="#blog" className="hover:text-[#0b3516]">
                                Blog
                            </a>
                            <a href="#tarifs" className="hover:text-[#0b3516]">
                                Tarifs
                            </a>
                            <a href="#faq" className="hover:text-[#0b3516]">
                                FAQ
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block">
                                <LanguageSwitcher compact />
                            </div>
                            <Link
                                href={destination}
                                className="hidden rounded-full border border-emerald-900/15 bg-white px-4 py-2 text-sm font-bold text-[#0b3516] shadow-sm transition hover:bg-emerald-50 sm:inline-flex"
                            >
                                {auth?.user ? 'Tableau de bord' : 'Connexion'}
                            </Link>
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden rounded-full bg-[#0b3516] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#14532d] sm:inline-flex"
                            >
                                Demander une démo
                            </a>
                        </div>
                    </div>
                </header>

                <main id="accueil">
                    <section
                        className="relative overflow-hidden bg-[#132018]"
                        style={{
                            backgroundImage: `linear-gradient(90deg, rgba(8, 26, 18, 0.86) 0%, rgba(10, 28, 21, 0.64) 46%, rgba(15, 23, 42, 0.18) 100%), url(${heroImage})`,
                            backgroundPosition: 'center top',
                            backgroundSize: 'cover',
                        }}
                    >
                        <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-10 overflow-hidden px-4 py-12 sm:px-6 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
                            <div className="relative z-10 min-w-0 max-w-full">
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-50">
                                        Solution pour syndics au Maroc
                                    </span>
                                    <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#fff4c1]">
                                        Pensée pour la loi 18-00
                                    </span>
                                </div>

                                <h1 className="mt-6 max-w-[21.5rem] text-4xl font-black leading-[1.05] tracking-tight text-white sm:max-w-3xl sm:text-6xl">
                                    Une plateforme claire pour piloter votre syndic.
                                </h1>
                                <p className="mt-6 max-w-[21.5rem] text-base leading-7 text-emerald-50/80 sm:max-w-2xl sm:text-lg sm:leading-8">
                                    SyndiCare rassemble charges, paiements, documents,
                                    annonces, réclamations et résidents dans une interface
                                    simple à suivre au quotidien.
                                </p>

                                <div className="mt-8 flex max-w-[21.5rem] flex-col gap-3 sm:max-w-none sm:flex-row">
                                    <Link
                                        href={destination}
                                        className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-[#0b3516] shadow-lg shadow-slate-950/20 transition hover:bg-emerald-50"
                                    >
                                        Accéder à l'espace syndic
                                    </Link>
                                    <a
                                        href="#produit"
                                        className="inline-flex justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-white/20"
                                    >
                                        Voir le produit
                                    </a>
                                </div>

                                <div className="mt-10 grid w-full max-w-[21.5rem] grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
                                    {[
                                        ['+10', 'modules métier'],
                                        ['24h', 'suivi continu'],
                                        ['100%', 'web responsive'],
                                    ].map(([value, label]) => (
                                        <div
                                            key={label}
                                            className="min-w-0 rounded-2xl border border-white/20 bg-white/10 p-3 shadow-sm backdrop-blur sm:p-4"
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

                            <div className="relative min-w-0 max-w-full">
                                <div className="rounded-[2rem] border border-white bg-white/80 p-3 shadow-2xl shadow-slate-950/10">
                                    <img
                                        src={localizedDesktopShot}
                                        alt="Aperçu du tableau de bord SyndiCare"
                                        className="aspect-[16/10] w-full rounded-[1.5rem] object-cover object-left-top"
                                    />
                                </div>

                                <div className="absolute -bottom-8 right-4 hidden w-36 rounded-[1.6rem] border border-white bg-white p-2 shadow-2xl shadow-slate-950/10 sm:block lg:w-44">
                                    <img
                                        src={localizedMobileShot}
                                        alt="Aperçu mobile SyndiCare"
                                        className="rounded-[1.2rem]"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="produit"
                        className="border-y border-emerald-950/10 bg-white py-16"
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="max-w-3xl">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                    Vue produit
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b3516] sm:text-4xl">
                                    Un espace web pour le syndic et une expérience simple pour les résidents.
                                </h2>
                            </div>

                            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-[#f6f2e9] p-3 shadow-sm">
                                    <img
                                        src={localizedFinanceShot}
                                        alt="Gestion financière SyndiCare"
                                        className="aspect-[16/9] w-full rounded-[1.5rem] object-cover object-left-top"
                                    />
                                </div>
                                <div className="grid gap-4">
                                    <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-[#f6f2e9] p-3 shadow-sm">
                                        <img
                                            src={localizedDocumentsShot}
                                            alt="Gestion des documents SyndiCare"
                                            className="aspect-[16/10] w-full rounded-[1.5rem] object-cover object-left-top"
                                        />
                                    </div>
                                    <div className="rounded-[2rem] bg-[#0b3516] p-6 text-white shadow-sm">
                                        <p className="text-sm font-semibold text-emerald-100">
                                            Tout est relié: les lots, les paiements, les documents,
                                            les tickets et les alertes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                    Accès résident
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b3516] sm:text-4xl">
                                    Une entrée simple et une communication facile à partager.
                                </h2>
                                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                                    La page de connexion rassure le résident, tandis que le flyer
                                    présente rapidement l'application et ses usages essentiels.
                                </p>
                                <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                                    {[
                                        ['Français et Arabe', 'Une expérience adaptée à la langue du résident.'],
                                        ['Rappels mensuels', 'Des rappels pour garder les paiements visibles.'],
                                        ['Connexion simple', 'Un accès clair avec mot de passe.'],
                                    ].map(([title, description]) => (
                                        <div
                                            key={title}
                                            className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                                        >
                                            <p className="font-black text-[#0b3516]">{title}</p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-xl shadow-emerald-950/10">
                                    <img
                                        src={localizedLoginShot}
                                        alt="Aperçu de la page de connexion SyndiCare"
                                        className="aspect-[16/9] w-full rounded-[1.5rem] object-cover object-center"
                                    />
                                </div>
                                <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-3 shadow-sm">
                                    <img
                                        src={flyerShot}
                                        alt="Flyer de présentation SyndiCare"
                                        className="aspect-[16/8] w-full rounded-[1.5rem] object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div id="fonctionnalites">
                        <FeatureList
                            eyebrow="Pour le syndic"
                            title="Un tableau de bord pour gérer le parc immobilier."
                            description="Le syndic garde une vision claire des opérations importantes et réduit les suivis dispersés entre Excel, messages et dossiers locaux."
                            features={syndicFeatures}
                        />

                        <section className="bg-[#0b3516] py-16 text-white">
                            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d4af37]">
                                        Pour les résidents
                                    </p>
                                    <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                                        Plus de transparence, moins d'appels répétitifs.
                                    </h2>
                                    <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50/80">
                                        Les locataires et copropriétaires retrouvent les informations
                                        utiles au bon endroit et suivent leurs demandes sans confusion.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {residentFeatures.map(([title, description]) => (
                                        <article
                                            key={title}
                                            className="rounded-2xl border border-white/10 bg-white/8 p-5"
                                        >
                                            <h3 className="text-lg font-bold">{title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-emerald-50/75">
                                                {description}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <section
                        id="blog"
                        className="border-y border-emerald-950/10 bg-white py-16"
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-3xl">
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                        Blog
                                    </p>
                                    <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b3516] sm:text-4xl">
                                        Des conseils pratiques pour gérer une copropriété avec plus de clarté.
                                    </h2>
                                    <p className="mt-4 text-base leading-7 text-slate-600">
                                        Une sélection de contenus courts pour aider les syndics à mieux
                                        organiser les finances, les documents et la relation avec les résidents.
                                    </p>
                                </div>
                                <a
                                    href="#tarifs"
                                    className="inline-flex w-fit justify-center rounded-full border border-emerald-900/15 bg-[#f6f2e9] px-5 py-3 text-sm font-black text-[#0b3516] transition hover:bg-emerald-50"
                                >
                                    Recevoir une démo
                                </a>
                            </div>

                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {blogPosts.map((post) => (
                                    <Link
                                        href={post.href}
                                        key={post.title}
                                        className="group overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-[#f6f2e9] shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10"
                                    >
                                        <img
                                            src={localizedBlogImage(post)}
                                            alt={post.title}
                                            className="aspect-[16/10] w-full object-cover object-left-top transition duration-500 group-hover:scale-[1.03]"
                                        />
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.16em]">
                                                <span className="text-emerald-700">{post.category}</span>
                                                <span className="text-slate-400">{post.readTime}</span>
                                            </div>
                                            <h3 className="mt-4 text-xl font-black leading-tight text-[#0b3516]">
                                                {post.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                {post.description}
                                            </p>
                                            <p className="mt-5 text-sm font-black text-[#0b3516]">
                                                Lire l'article
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="tarifs" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                    Tarification
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b3516] sm:text-4xl">
                                    Estimez votre abonnement selon le nombre de lots.
                                </h2>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    Ajustez le volume géré et choisissez le mode de facturation.
                                    Le simulateur donne une estimation simple pour préparer votre offre.
                                </p>

                                <div className="mt-6 grid gap-3">
                                    {[
                                        ['Portefeuille léger', 'Moins de 20 lots', '100 Dh / mois'],
                                        ['Portefeuille standard', '20 à 100 lots', '4,7 Dh / lot'],
                                        ['Portefeuille étendu', 'Plus de 100 lots', '4,5 Dh / lot'],
                                    ].map(([name, range, price]) => (
                                        <div
                                            key={name}
                                            className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                                        >
                                            <p className="font-bold text-slate-950">{name}</p>
                                            <p className="mt-1 text-sm text-slate-500">{range}</p>
                                            <p className="mt-2 text-sm font-black text-[#0b3516]">
                                                {price}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-white bg-white p-6 shadow-xl shadow-emerald-950/10">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">
                                            Nombre total de lots
                                        </p>
                                        <p className="mt-1 text-4xl font-black text-[#0b3516]">
                                            {lots}
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-emerald-50 p-1">
                                        {[
                                            ['monthly', 'Mensuel'],
                                            ['annual', 'Annuel -10%'],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setBilling(value)}
                                                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                                    billing === value
                                                        ? 'bg-[#0b3516] text-white'
                                                        : 'text-emerald-900'
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
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateLots(lots - 1)}
                                            disabled={lots <= LOT_MIN}
                                            aria-label="Retirer un lot"
                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white text-xl font-black text-[#0b3516] shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                                            onInput={(event) => updateLots(event.currentTarget.value)}
                                            onChange={(event) => updateLots(event.currentTarget.value)}
                                            className="h-11 w-28 rounded-xl border-emerald-200 text-center text-base font-black text-[#0b3516] focus:border-[#0b3516] focus:ring-[#0b3516]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => updateLots(lots + 1)}
                                            disabled={lots >= LOT_MAX}
                                            aria-label="Ajouter un lot"
                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 bg-white text-xl font-black text-[#0b3516] shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                                    onInput={(event) => updateLots(event.currentTarget.value)}
                                    onChange={(event) => updateLots(event.currentTarget.value)}
                                    className="mt-6 h-2 w-full cursor-pointer rounded-full accent-[#0b3516]"
                                    style={{
                                        background: `linear-gradient(to right, #0b3516 ${sliderProgress}%, #d1fae5 ${sliderProgress}%)`,
                                    }}
                                />
                                <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                                    <span>1 lot</span>
                                    <span>1000 lots</span>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {PRICING_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => updateLots(preset)}
                                            className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                                                lots === preset
                                                    ? 'border-[#0b3516] bg-[#0b3516] text-white'
                                                    : 'border-emerald-200 bg-emerald-50 text-[#0b3516] hover:bg-emerald-100'
                                            }`}
                                        >
                                            {preset} lots
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 rounded-[1.5rem] bg-[#0b3516] p-6 text-white">
                                    <p className="text-sm font-semibold text-emerald-100">
                                        Total estimé
                                    </p>
                                    <p key={monthlyPrice} className="mt-2 text-5xl font-black">
                                        {formatPrice(monthlyPrice)}
                                    </p>
                                    <p className="mt-2 text-sm text-emerald-50/75">
                                        par mois {billing === 'annual' ? 'avec facturation annuelle' : 'en facturation mensuelle'}
                                    </p>
                                    <div className="mt-5 grid gap-2 text-sm font-semibold text-emerald-50/90 sm:grid-cols-2">
                                        <p className="rounded-xl bg-white/10 px-3 py-2">
                                            Tarif: {pricingDetails.rateLabel}
                                        </p>
                                        <p className="rounded-xl bg-white/10 px-3 py-2">
                                            Calcul: {pricingDetails.calculation}
                                        </p>
                                    </div>
                                    {billing === 'annual' && (
                                        <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-50/90">
                                            Total annuel estime: {formatPrice(annualPrice)}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                                    {['Multi-immeubles', 'Résidents illimités', 'Support et assistance', 'Mises à jour incluses'].map((item) => (
                                        <p key={item} className="rounded-xl bg-emerald-50 px-3 py-2">
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="rounded-[2rem] bg-[#0b3516] p-8 text-white shadow-xl shadow-emerald-950/20 sm:p-10">
                                <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d4af37]">
                                            Prêt à tester
                                        </p>
                                        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                                            Lancez une gestion plus claire dès cette semaine.
                                        </h2>
                                        <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80">
                                            Présentez vos immeubles, vos lots et votre méthode actuelle.
                                            SyndiCare vous aide à organiser le suivi dans une plateforme unique.
                                        </p>
                                    </div>
                                    <a
                                        href={WHATSAPP_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-[#0b3516] transition hover:bg-emerald-50"
                                    >
                                        Contacter sur WhatsApp
                                    </a>
                                </div>
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="mt-5 inline-flex text-sm font-bold text-emerald-50/85 underline-offset-4 hover:text-white hover:underline"
                                >
                                    {CONTACT_EMAIL}
                                </a>
                            </div>
                        </div>
                    </section>

                    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                FAQ
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b3516]">
                                Questions fréquentes
                            </h2>
                        </div>

                        <div className="mt-8 space-y-3">
                            {faqs.map(([question, answer]) => (
                                <details
                                    key={question}
                                    className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                                >
                                    <summary className="cursor-pointer list-none text-base font-bold text-slate-950">
                                        {question}
                                    </summary>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        {answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-emerald-950/10 bg-[#0b3516] text-white">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto_auto_auto] lg:px-8">
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
                                Plateforme de gestion pour syndics: finances, réclamations,
                                documents, annonces et suivi résident.
                            </p>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Produit</p>
                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <a href="#produit">Aperçu</a>
                                <a href="#fonctionnalites">Fonctionnalités</a>
                                <a href="#tarifs">Tarifs</a>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Accès</p>
                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <Link href={route('login')}>Connexion</Link>
                                <Link href={route('register')}>Inscription</Link>
                            </div>
                        </div>
                        <div className="text-sm">
                            <p className="font-black">Contact</p>
                            <div className="mt-3 grid gap-2 text-emerald-50/75">
                                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
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
