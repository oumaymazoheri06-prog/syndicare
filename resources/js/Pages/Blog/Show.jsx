import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nProvider';
import { blogImageForLocale, blogPosts } from './articles';

function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function LegalLine({ line }) {
    if (line.startsWith('- ')) {
        return (
            <p className="flex gap-3 text-base leading-8 text-slate-600">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4af37]" />
                <span>{line.slice(2)}</span>
            </p>
        );
    }

    return <p className="text-base leading-8 text-slate-600">{line}</p>;
}

export default function Show({ slug }) {
    const { locale } = useI18n();
    const [search, setSearch] = useState('');
    const article = blogPosts.find((post) => post.slug === slug);
    const legalGroups = article?.legalContent?.groups ?? [];
    const filteredLegalGroups = useMemo(() => {
        const term = normalizeText(search.trim());

        if (!term) {
            return legalGroups;
        }

        return legalGroups
            .map((group) => ({
                ...group,
                articles: group.articles.filter((legalArticle) => {
                    const content = [
                        legalArticle.number,
                        legalArticle.note ?? '',
                        ...legalArticle.body,
                    ].join(' ');

                    return normalizeText(content).includes(term);
                }),
            }))
            .filter((group) => group.articles.length > 0);
    }, [legalGroups, search]);

    const hasLegalResults = filteredLegalGroups.some(
        (group) => group.articles.length > 0,
    );

    if (!article) {
        return (
            <>
                <Head title="Article introuvable" />
                <main className="min-h-screen bg-[#f6f2e9] px-4 py-16 text-slate-900">
                    <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                            Blog
                        </p>
                        <h1 className="mt-3 text-3xl font-black text-[#0b3516]">
                            Article introuvable
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            L'article demandé n'existe pas ou a été déplacé.
                        </p>
                        <Link
                            href="/#blog"
                            className="mt-6 inline-flex rounded-full bg-[#0b3516] px-5 py-3 text-sm font-black text-white"
                        >
                            Retour au blog
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Head title={`${article.title} - Blog SyndiCare`} />

            <main className="min-h-screen bg-[#f6f2e9] text-slate-900">
                <header className="border-b border-emerald-950/10 bg-white">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="Logo SyndiCare"
                                className="h-12 w-12 object-contain"
                            />
                            <div>
                                <p className="text-xl font-black text-[#0b3516]">
                                    SyndiCare
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-800">
                                    Blog syndic
                                </p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-2">
                            <LanguageSwitcher compact />
                            <Link
                                href="/#blog"
                                className="rounded-full border border-emerald-900/15 px-4 py-2 text-sm font-black text-[#0b3516] transition hover:bg-emerald-50"
                            >
                                Tous les articles
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
                    <div>
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-800">
                                {article.category}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                {article.readTime}
                            </span>
                        </div>
                        <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[#0b3516] sm:text-5xl">
                            {article.title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                            {article.description}
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-xl shadow-emerald-950/10">
                        <img
                            src={blogImageForLocale(article, locale)}
                            alt={article.title}
                            className="aspect-[16/10] w-full rounded-[1.5rem] object-cover object-left-top"
                        />
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_20rem] lg:px-8">
                    <article className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
                        {article.sections.map((section) => (
                            <section key={section.heading} className="border-b border-emerald-100 py-6 first:pt-0 last:border-b-0 last:pb-0">
                                <h2 className="text-2xl font-black text-[#0b3516]">
                                    {section.heading}
                                </h2>
                                <div className="mt-4 space-y-4">
                                    {section.body.map((paragraph) => (
                                        <p
                                            key={paragraph}
                                            className="text-base leading-8 text-slate-600"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </section>
                        ))}

                        {article.legalContent && (
                            <section className="mt-8 rounded-[1.5rem] border border-emerald-100 bg-[#f6f2e9] p-5 sm:p-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
                                            Référence juridique
                                        </p>
                                        <h2 className="mt-3 text-2xl font-black text-[#0b3516]">
                                            {article.legalContent.title}
                                        </h2>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                            {article.legalContent.description}
                                        </p>
                                    </div>

                                    <label className="block w-full lg:max-w-sm">
                                        <span className="sr-only">
                                            Rechercher un article
                                        </span>
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder={article.legalContent.placeholder}
                                            className="w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                        />
                                    </label>
                                </div>

                                <div className="mt-6 space-y-6">
                                    {hasLegalResults ? (
                                        filteredLegalGroups.map((group) => (
                                            <div key={group.title}>
                                                <h3 className="rounded-2xl bg-[#0b3516] px-5 py-4 text-lg font-black text-white">
                                                    {group.title}
                                                </h3>
                                                <div className="mt-4 space-y-4">
                                                    {group.articles.map((legalArticle) => (
                                                        <section
                                                            key={legalArticle.number}
                                                            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                                                        >
                                                            <h4 className="text-xl font-black text-[#0b3516]">
                                                                {legalArticle.number}
                                                            </h4>
                                                            <div className="mt-4 space-y-3">
                                                                {legalArticle.body.map((line) => (
                                                                    <LegalLine
                                                                        key={`${legalArticle.number}-${line}`}
                                                                        line={line}
                                                                    />
                                                                ))}
                                                            </div>
                                                            {legalArticle.note && (
                                                                <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold leading-5 text-emerald-900">
                                                                    {legalArticle.note}
                                                                </p>
                                                            )}
                                                        </section>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl bg-white p-5 text-sm font-semibold text-slate-500">
                                            Aucun article ne correspond à votre recherche.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </article>

                    <aside className="h-fit rounded-[2rem] bg-[#0b3516] p-6 text-white shadow-sm">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d4af37]">
                            SyndiCare
                        </p>
                        <h2 className="mt-3 text-2xl font-black">
                            Passez de la théorie au suivi quotidien.
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-emerald-50/75">
                            Centralisez vos documents, charges, paiements et réclamations
                            dans un espace clair pour le syndic et les résidents.
                        </p>
                        <Link
                            href="/#tarifs"
                            className="mt-6 inline-flex w-full justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-[#0b3516]"
                        >
                            Demander une demo
                        </Link>
                    </aside>
                </section>
            </main>
        </>
    );
}
