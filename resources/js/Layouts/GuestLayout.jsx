import {
    authCardClass,
    authPageClass,
    authShellClass,
} from './authStyles';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function GuestLayout({ children }) {
    return (
        <div className={authPageClass}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f7faf8_55%,_#eef5ef_100%)]" />

            <div className={authShellClass}>
                <section className="relative z-10 w-full min-w-0">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <a href="/" className="flex min-w-0 items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-950/10 bg-white shadow-sm">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo SyndiCare"
                                    className="h-8 w-8 object-contain"
                                />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-base font-black text-[#0F5132]">
                                    SyndiCare
                                </span>
                                <span className="block truncate text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                                    Gestion syndic
                                </span>
                            </span>
                        </a>

                        <LanguageSwitcher compact />
                    </div>

                    <div className={authCardClass}>{children}</div>

                    <div className="mt-4 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                        <a href="/" className="text-emerald-800 transition hover:text-[#0F5132] hover:underline">
                            Accueil
                        </a>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>Accès sécurisé</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
