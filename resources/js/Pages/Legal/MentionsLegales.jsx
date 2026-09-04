import { Head, Link } from "@inertiajs/react";
import { useI18n } from "@/i18n/I18nProvider";

export default function MentionsLegales() {
    const { locale } = useI18n();
    const isArabic = locale === "ar";

    return (
        <>
            <Head
                title={
                    isArabic
                        ? "الإشعارات القانونية - SyndiCare"
                        : "Mentions légales - SyndiCare"
                }
            />

            <main className="min-h-screen bg-[#f8faf8] text-slate-900">
                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
                    <Link
                        href="/"
                        className="text-sm font-bold text-[#0F5132] transition hover:text-emerald-700"
                    >
                        {isArabic
                            ? "← العودة إلى SyndiCare"
                            : "← Retour à SyndiCare"}
                    </Link>

                    <header className="mt-8 border-b border-emerald-950/10 pb-8">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                            {isArabic
                                ? "المعلومات القانونية"
                                : "Informations légales"}
                        </p>

                        <h1 className="mt-3 text-3xl font-black text-[#0F5132] sm:text-4xl">
                            {isArabic
                                ? "الإشعارات القانونية"
                                : "Mentions légales"}
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            {isArabic
                                ? "معلومات متعلقة بنشر واستضافة واستخدام منصة SyndiCare."
                                : "Informations relatives à l’édition, l’hébergement et l’utilisation de la plateforme SyndiCare."}
                        </p>
                    </header>

                    <div className="mt-10 space-y-10">
                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "1. ناشر الموقع"
                                    : "1. Éditeur du site"}
                            </h2>

                            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                                <p>
                                    <strong className="text-slate-800">
                                        {isArabic ? "الاسم :" : "Nom :"}
                                    </strong>{" "}
                                    SyndiCare
                                </p>

                                <p>
                                    <strong className="text-slate-800">
                                        {isArabic ? "النشاط :" : "Activité :"}
                                    </strong>{" "}
                                    {isArabic
                                        ? "منصة رقمية لإدارة الملكية المشتركة"
                                        : "Plateforme numérique de gestion de copropriétés"}
                                </p>

                                <p>
                                    <strong className="text-slate-800">
                                        {isArabic ? "البلد :" : "Pays :"}
                                    </strong>{" "}
                                    {isArabic ? "المغرب" : "Maroc"}
                                </p>

                                <p>
                                    <strong className="text-slate-800">
                                        {isArabic ? "التواصل :" : "Contact :"}
                                    </strong>{" "}
                                    <a
                                        href="mailto:syndicaremanager@gmail.com"
                                        className="font-bold text-emerald-700 hover:underline"
                                    >
                                        syndicaremanager@gmail.com
                                    </a>
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "2. مسؤول النشر"
                                    : "2. Responsable de publication"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يتولى الفريق المسؤول عن مشروع SyndiCare نشر وإدارة محتوى المنصة."
                                    : "La publication et la gestion du contenu de SyndiCare sont assurées par l’équipe responsable du projet SyndiCare."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic ? "3. الاستضافة" : "3. Hébergement"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "سيتم استكمال المعلومات المتعلقة بمزود الاستضافة وفق البنية التحتية المستخدمة عند نشر SyndiCare على الإنترنت."
                                    : "Les informations relatives à l’hébergeur seront complétées selon l’infrastructure utilisée pour la mise en production de SyndiCare."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "4. الملكية الفكرية"
                                    : "4. Propriété intellectuelle"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "العناصر الموجودة على SyndiCare، بما في ذلك النصوص والواجهات والعناصر الرسومية والشعارات والوظائف والمحتويات، محمية وفق القواعد المعمول بها في مجال الملكية الفكرية."
                                    : "Les éléments présents sur SyndiCare, notamment les textes, interfaces, éléments graphiques, logos, fonctionnalités et contenus, sont protégés par les règles applicables en matière de propriété intellectuelle."}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يُمنع نسخ أو تعديل أو استغلال هذه العناصر دون إذن مسبق."
                                    : "Toute reproduction, modification ou exploitation non autorisée de ces éléments est interdite sauf autorisation préalable."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "5. المسؤولية"
                                    : "5. Responsabilité"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "تسعى SyndiCare إلى توفير خدمة موثوقة ومعلومات متاحة باستخدام الوسائل المعقولة، إلا أنه لا يمكن ضمان توفر الخدمة بشكل دائم أو خلوها التام من الأخطاء."
                                    : "SyndiCare met en œuvre les moyens raisonnables pour fournir un service fiable et des informations accessibles. Toutefois, aucune disponibilité permanente ou absence totale d’erreurs ne peut être garantie."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "6. البيانات الشخصية"
                                    : "6. Données personnelles"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "ترد المعلومات المتعلقة بجمع البيانات الشخصية واستخدامها وحمايتها بالتفصيل في سياسة الخصوصية الخاصة بـ SyndiCare."
                                    : "Les informations concernant la collecte, l’utilisation et la protection des données personnelles sont détaillées dans la Politique de confidentialité de SyndiCare."}
                            </p>

                            <Link
                                href="/confidentialite"
                                className="mt-3 inline-flex font-bold text-emerald-700 hover:underline"
                            >
                                {isArabic
                                    ? "الاطلاع على سياسة الخصوصية ←"
                                    : "Consulter la politique de confidentialité →"}
                            </Link>
                        </section>
                    </div>

                    <div className="mt-14 border-t border-emerald-950/10 pt-6 text-xs text-slate-500">
                        {isArabic
                            ? "آخر تحديث: شتنبر 2026"
                            : "Dernière mise à jour : septembre 2026"}
                    </div>
                </div>
            </main>
        </>
    );
}
