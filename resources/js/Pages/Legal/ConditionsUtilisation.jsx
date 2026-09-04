import { Head, Link } from "@inertiajs/react";
import { useI18n } from "@/i18n/I18nProvider";

export default function ConditionsUtilisation() {
    const { locale } = useI18n();
    const isArabic = locale === "ar";

    return (
        <>
            <Head
                title={
                    isArabic
                        ? "شروط الاستخدام - SyndiCare"
                        : "Conditions d’utilisation - SyndiCare"
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
                                ? "استخدام المنصة"
                                : "Utilisation de la plateforme"}
                        </p>

                        <h1 className="mt-3 text-3xl font-black text-[#0F5132] sm:text-4xl">
                            {isArabic
                                ? "شروط الاستخدام"
                                : "Conditions d’utilisation"}
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-slate-600">
                            {isArabic
                                ? "تحدد هذه الشروط القواعد المطبقة على الوصول إلى منصة SyndiCare واستخدامها."
                                : "Les présentes conditions définissent les règles applicables à l’accès et à l’utilisation de la plateforme SyndiCare."}
                        </p>
                    </header>

                    <div className="mt-10 space-y-10">
                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic ? "1. الهدف" : "1. Objet"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "SyndiCare هي منصة رقمية مخصصة لتسهيل إدارة الملكيات المشتركة، بما في ذلك تتبع العمارات والشقق والسكان والتكاليف والأداءات والوثائق والإعلانات والشكايات."
                                    : "SyndiCare est une plateforme numérique destinée à faciliter la gestion de copropriétés, notamment le suivi des immeubles, lots, résidents, charges, paiements, documents, annonces et réclamations."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "2. الوصول إلى الخدمة"
                                    : "2. Accès au service"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "بعض الوظائف متاحة فقط للمستخدمين الذين يتوفرون على حساب. ويلتزم المستخدم بتقديم معلومات صحيحة عند التسجيل والحفاظ على تحديثها."
                                    : "Certaines fonctionnalités sont accessibles uniquement aux utilisateurs disposant d’un compte. L’utilisateur s’engage à fournir des informations exactes lors de son inscription et à maintenir ses informations à jour."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "3. أمان الحساب"
                                    : "3. Sécurité du compte"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات الدخول الخاصة به، واتخاذ التدابير اللازمة لمنع أي وصول غير مصرح به إلى حسابه."
                                    : "L’utilisateur est responsable de la confidentialité de ses identifiants de connexion et doit prendre les précautions nécessaires afin d’empêcher tout accès non autorisé à son compte."}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يجب الإبلاغ في أقرب وقت ممكن عن أي استخدام مشبوه أو وصول غير مصرح به."
                                    : "Toute utilisation suspecte ou accès non autorisé doit être signalé dès que possible."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "4. الاستخدام المسموح"
                                    : "4. Utilisation autorisée"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يجب استخدام SyndiCare فقط في إطار الوظائف المخصصة لها وبما يتوافق مع القوانين والأنظمة المعمول بها."
                                    : "SyndiCare doit être utilisé dans le cadre de ses fonctionnalités prévues et conformément à la réglementation applicable."}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "ويُمنع بشكل خاص محاولة تجاوز آليات الأمان، أو الوصول إلى بيانات مستخدمين آخرين دون إذن، أو تعطيل عمل الخدمة، أو استخدام المنصة لأغراض احتيالية."
                                    : "Il est notamment interdit de tenter de contourner les mécanismes de sécurité, d’accéder aux données d’autres utilisateurs sans autorisation, de perturber le fonctionnement du service ou d’utiliser la plateforme à des fins frauduleuses."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "5. البيانات والمحتويات"
                                    : "5. Données et contenus"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يبقى المستخدمون مسؤولين عن المعلومات والوثائق والمحتويات التي يقومون بحفظها أو إرسالها عبر SyndiCare."
                                    : "Les utilisateurs restent responsables des informations, documents et contenus qu’ils enregistrent ou transmettent via SyndiCare."}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "ويجب عليهم التأكد من أنهم يتوفرون على الحقوق اللازمة لاستخدام هذه المحتويات ومشاركتها في إطار إدارة الملكية المشتركة."
                                    : "Ils doivent s’assurer qu’ils disposent des droits nécessaires pour utiliser et partager ces contenus dans le cadre de la gestion de la copropriété."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "6. توفر الخدمة"
                                    : "6. Disponibilité du service"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "تبذل SyndiCare الوسائل المعقولة لضمان توفر المنصة. ومع ذلك قد تكون بعض الانقطاعات ضرورية لأعمال الصيانة أو التحديثات أو بسبب ظروف تقنية خارجة عن سيطرة الخدمة."
                                    : "SyndiCare met en œuvre les moyens raisonnables pour assurer la disponibilité de la plateforme. Certaines interruptions peuvent toutefois être nécessaires pour des opérations de maintenance, des mises à jour ou en raison de circonstances techniques indépendantes du service."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "7. المسؤولية"
                                    : "7. Responsabilité"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "تشكل SyndiCare أداة للتنظيم والتسيير، ولا تحل محل الالتزامات القانونية أو المحاسبية أو الإدارية أو التعاقدية التي قد تقع على عاتق السانديك أو المستخدمين."
                                    : "SyndiCare constitue un outil d’organisation et de gestion. La plateforme ne se substitue pas aux obligations légales, comptables, administratives ou contractuelles qui peuvent incomber au syndic ou aux utilisateurs."}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "ويبقى كل مستخدم مسؤولاً عن القرارات التي يتخذها اعتماداً على المعلومات المتاحة في مساحته."
                                    : "Chaque utilisateur reste responsable des décisions prises à partir des informations disponibles dans son espace."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "8. الملكية الفكرية"
                                    : "8. Propriété intellectuelle"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "لا يجوز نسخ أو استغلال بنية SyndiCare وتصميمها وواجهاتها وعناصرها الرسومية وشعارها ونصوصها ووظائفها دون إذن مسبق."
                                    : "La structure, le design, les interfaces, les éléments graphiques, le logo, les textes et les fonctionnalités propres à SyndiCare ne peuvent pas être reproduits ou exploités sans autorisation préalable."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "9. حماية البيانات"
                                    : "9. Protection des données"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يتم توضيح معالجة البيانات الشخصية عبر SyndiCare في سياسة الخصوصية."
                                    : "Le traitement des données personnelles effectué via SyndiCare est décrit dans la Politique de confidentialité."}
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

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic
                                    ? "10. تعديل الشروط"
                                    : "10. Modification des conditions"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "يمكن تعديل هذه الشروط لمواكبة تطور SyndiCare أو وظائفها أو القواعد المطبقة."
                                    : "Les présentes conditions peuvent être modifiées afin de tenir compte de l’évolution de SyndiCare, de ses fonctionnalités ou des règles applicables."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-[#0F5132]">
                                {isArabic ? "11. التواصل" : "11. Contact"}
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {isArabic
                                    ? "لأي سؤال متعلق باستخدام SyndiCare:"
                                    : "Pour toute question concernant l’utilisation de SyndiCare :"}
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
