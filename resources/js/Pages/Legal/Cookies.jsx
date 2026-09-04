import { Head, Link } from "@inertiajs/react";
import { useI18n } from "@/i18n/I18nProvider";

export default function Cookies() {
    const { locale } = useI18n();
    const isArabic = locale === "ar";

    return (
        <>
            <Head
                title={
                    isArabic
                        ? "سياسة ملفات تعريف الارتباط - SyndiCare"
                        : "Politique de cookies - SyndiCare"
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
                                ? "ملفات تعريف الارتباط والتخزين المحلي"
                                : "Cookies et stockage local"}
                        </p>

                        <h1 className="mt-3 text-3xl font-black text-[#0F5132] sm:text-4xl">
                            {isArabic
                                ? "سياسة ملفات تعريف الارتباط"
                                : "Politique de cookies"}
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            {isArabic
                                ? "توضح هذه السياسة كيفية استخدام ملفات تعريف الارتباط والتقنيات المشابهة الضرورية لتشغيل SyndiCare."
                                : "Cette politique explique l’utilisation des cookies et technologies similaires nécessaires au fonctionnement de SyndiCare."}
                        </p>
                    </header>

                    <div className="mt-10 space-y-10">
                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "1. ما هو ملف تعريف الارتباط؟"
                                    : "1. Qu’est-ce qu’un cookie ?"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "ملف تعريف الارتباط هو ملف صغير يحفظه المتصفح أثناء زيارة موقع أو تطبيق ويب. ويمكن استخدامه للحفاظ على الجلسة أو تذكر بعض التفضيلات أو ضمان حسن عمل الخدمة."
                                    : "Un cookie est un petit fichier enregistré par le navigateur lors de la consultation d’un site ou d’une application web. Il peut notamment permettre de maintenir une session, mémoriser certaines préférences ou assurer le bon fonctionnement du service."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "2. ملفات تعريف الارتباط المستخدمة"
                                    : "2. Cookies utilisés par SyndiCare"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "قد تستخدم SyndiCare ملفات تعريف ارتباط ضرورية لتشغيل المنصة، خصوصاً للمصادقة والأمان وإدارة الجلسات وبعض تفضيلات المستخدم."
                                    : "SyndiCare peut utiliser des cookies strictement nécessaires au fonctionnement de la plateforme, notamment pour l’authentification, la sécurité, la gestion des sessions et certaines préférences utilisateur."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "3. التخزين المحلي"
                                    : "3. Stockage local"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "قد يتم أيضاً حفظ بعض التفضيلات التقنية في التخزين المحلي للمتصفح، مثلاً لتذكر اختيار معين في الواجهة أو لتجنب عرض بعض العناصر بشكل متكرر."
                                    : "Certaines préférences techniques peuvent également être conservées dans le stockage local du navigateur, par exemple afin de mémoriser un choix d’interface ou d’éviter l’affichage répété de certains éléments."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "4. ملفات تعريف الارتباط الضرورية"
                                    : "4. Cookies nécessaires"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "تسمح ملفات تعريف الارتباط الضرورية باستخدام الوظائف الأساسية في SyndiCare. وقد يؤدي تعطيلها إلى منع بعض أجزاء المنصة من العمل بشكل صحيح."
                                    : "Les cookies strictement nécessaires permettent d’utiliser les principales fonctionnalités de SyndiCare. Leur désactivation peut empêcher certaines parties de la plateforme de fonctionner correctement."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "5. ملفات الإعلانات والتتبع"
                                    : "5. Cookies publicitaires et de suivi"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "لا تستخدم SyndiCare حالياً ملفات تعريف ارتباط إعلانية تهدف إلى إنشاء ملفات شخصية تجارية للمستخدمين."
                                    : "SyndiCare n’utilise actuellement pas de cookies publicitaires destinés à établir un profil commercial des utilisateurs."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "6. إدارة ملفات تعريف الارتباط"
                                    : "6. Gestion des cookies"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يمكنكم عرض ملفات تعريف الارتباط أو حذفها أو حظرها من إعدادات المتصفح. وقد يؤدي حذف بعض الملفات إلى تسجيل الخروج أو فقدان بعض التفضيلات."
                                    : "Vous pouvez consulter, supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. La suppression de certains cookies peut entraîner une déconnexion ou la perte de certaines préférences."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "7. تحديث هذه السياسة"
                                    : "7. Évolution de cette politique"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يمكن تحديث هذه السياسة إذا تم إدماج وظائف جديدة أو تقنيات جديدة داخل SyndiCare."
                                    : "Cette politique pourra être mise à jour si de nouvelles fonctionnalités ou technologies de suivi sont intégrées à SyndiCare."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic ? "8. التواصل" : "8. Contact"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "لأي سؤال متعلق باستخدام ملفات تعريف الارتباط على SyndiCare:"
                                    : "Pour toute question concernant l’utilisation des cookies sur SyndiCare :"}
                            </p>

                            <a
                                href="mailto:syndicaremanager@gmail.com"
                                className="mt-2 inline-flex font-bold text-emerald-700 hover:underline"
                            >
                                syndicaremanager@gmail.com
                            </a>
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
