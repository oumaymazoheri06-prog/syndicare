import { Head, Link } from "@inertiajs/react";
import { useI18n } from "@/i18n/I18nProvider";

export default function Confidentialite() {
    const { locale } = useI18n();
    const isArabic = locale === "ar";

    return (
        <>
            <Head
                title={
                    isArabic
                        ? "سياسة الخصوصية - SyndiCare"
                        : "Politique de confidentialité - SyndiCare"
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
                                ? "حماية البيانات"
                                : "Protection des données"}
                        </p>

                        <h1 className="mt-3 text-3xl font-black text-[#0F5132] sm:text-4xl">
                            {isArabic
                                ? "سياسة الخصوصية"
                                : "Politique de confidentialité"}
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            {isArabic
                                ? "توضح هذه السياسة كيفية جمع SyndiCare للبيانات الشخصية واستخدامها وحمايتها في إطار استخدام المنصة."
                                : "Cette politique explique comment SyndiCare collecte, utilise et protège les données personnelles traitées dans le cadre de l’utilisation de la plateforme."}
                        </p>
                    </header>

                    <div className="mt-10 space-y-10">
                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "1. البيانات التي يتم جمعها"
                                    : "1. Données collectées"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "حسب الوظائف المستخدمة، قد تعالج SyndiCare معلومات مثل الاسم والبريد الإلكتروني وبيانات التواصل، إضافة إلى المعلومات المرتبطة بالشقق والعمارات والأداءات والوثائق والطلبات المرسلة عبر المنصة."
                                    : "Selon les fonctionnalités utilisées, SyndiCare peut traiter des informations telles que le nom, l’adresse e-mail, les coordonnées de contact, les informations liées aux lots, aux immeubles, aux paiements, aux documents et aux demandes envoyées via la plateforme."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "2. أهداف معالجة البيانات"
                                    : "2. Finalités du traitement"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "تُستخدم البيانات لضمان عمل SyndiCare، وإدارة الحسابات، وتمكين تتبع شؤون الملكية المشتركة، ومعالجة الأداءات والشكايات، ونشر الوثائق والتواصلات الضرورية، وتحسين جودة الخدمة."
                                    : "Les données sont utilisées afin d’assurer le fonctionnement de SyndiCare, gérer les comptes, permettre le suivi de la copropriété, traiter les paiements et réclamations, diffuser les documents et communications nécessaires, et améliorer la qualité du service."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "3. الوصول إلى البيانات"
                                    : "3. Accès aux données"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يتم تقييد الوصول إلى المعلومات حسب دور كل مستخدم. ولا يمكن للسانديك أو المالك المشترك أو المكتري الوصول إلا إلى البيانات الضرورية لاستخدام المساحة الخاصة به."
                                    : "L’accès aux informations est limité selon le rôle de chaque utilisateur. Un syndic, un copropriétaire ou un locataire n’accède qu’aux données nécessaires à l’utilisation de son espace."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "4. مدة الاحتفاظ بالبيانات"
                                    : "4. Conservation des données"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يتم الاحتفاظ بالبيانات طوال المدة اللازمة لتقديم الخدمة والامتثال للالتزامات المطبقة. وبعد ذلك يمكن حذفها أو أرشفتها عندما لا تعود هناك حاجة إلى الاحتفاظ بها."
                                    : "Les données sont conservées pendant la durée nécessaire à la fourniture du service et au respect des obligations applicables. Elles peuvent ensuite être supprimées ou archivées lorsque leur conservation n’est plus nécessaire."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic ? "5. حماية البيانات" : "5. Sécurité"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "تعتمد SyndiCare تدابير تقنية وتنظيمية تهدف إلى الحد من الوصول غير المصرح به إلى البيانات أو فقدانها أو تعديلها أو الكشف عنها."
                                    : "SyndiCare met en place des mesures techniques et organisationnelles destinées à limiter les accès non autorisés, les pertes, les modifications ou les divulgations de données."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "6. مشاركة البيانات"
                                    : "6. Partage des données"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "لا يتم بيع البيانات الشخصية. ويمكن مشاركتها فقط عندما يكون ذلك ضرورياً لتشغيل الخدمة، أو مع مزود تقني مخول، أو عندما يفرض القانون ذلك."
                                    : "Les données personnelles ne sont pas vendues. Elles peuvent être transmises uniquement lorsque cela est nécessaire au fonctionnement du service, à un prestataire technique autorisé ou lorsqu’une obligation légale l’exige."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic ? "7. حقوقكم" : "7. Vos droits"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يمكنكم طلب الوصول إلى بعض بياناتكم الشخصية أو تصحيحها أو حذفها، وذلك في الحدود التي يسمح بها القانون المعمول به."
                                    : "Vous pouvez demander l’accès, la rectification ou la suppression de certaines données personnelles vous concernant, dans les limites prévues par la réglementation applicable."}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "لأي طلب متعلق ببياناتكم الشخصية:"
                                    : "Pour toute demande concernant vos données :"}
                            </p>

                            <a
                                href="mailto:syndicaremanager@gmail.com"
                                className="mt-2 inline-flex font-bold text-emerald-700 hover:underline"
                            >
                                syndicaremanager@gmail.com
                            </a>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "8. ملفات تعريف الارتباط"
                                    : "8. Cookies"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "قد تستخدم SyndiCare ملفات تعريف ارتباط ضرورية لتشغيل المنصة، خاصة لإدارة الجلسات والأمان وتفضيلات المستخدم."
                                    : "SyndiCare peut utiliser des cookies strictement nécessaires au fonctionnement de la plateforme, notamment pour la session, la sécurité et les préférences utilisateur."}
                            </p>

                            <Link
                                href="/cookies"
                                className="mt-3 inline-flex font-bold text-emerald-700 hover:underline"
                            >
                                {isArabic
                                    ? "الاطلاع على سياسة ملفات تعريف الارتباط ←"
                                    : "Consulter la politique de cookies →"}
                            </Link>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "9. تعديل هذه السياسة"
                                    : "9. Modification de cette politique"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يمكن تحديث هذه السياسة لمواكبة تطور الخدمة أو الالتزامات القانونية والتنظيمية المطبقة."
                                    : "Cette politique peut être mise à jour afin de tenir compte des évolutions du service ou des obligations applicables."}
                            </p>
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
