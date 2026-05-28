import NotificationDropdown from "@/Components/NotificationDropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import Dropdown from "@/Components/Dropdown";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
const navSections = [
    {
        label: "Accueil",
        items: [
            {
                label: "Tableau de bord",
                href: route("dashboard"),
                match: "dashboard",
            },
            {
                label: "Membres",
                href: route("users.index"),
                match: "users.*",
            },
        ],
    },
    {
        label: "Patrimoine",
        items: [
            {
                label: "Immeubles",
                href: route("buildings.index"),
                match: "buildings.*",
            },
            {
                label: "Lots",
                href: route("apartments.index"),
                match: "apartments.*",
            },
            { label: "Etages", href: route("floors.index"), match: "floors.*" },
        ],
    },
    {
        label: "Finance",
        items: [
            {
                label: "Charges",
                href: route("charges.index"),
                match: "charges.*",
            },
            {
                label: "Depenses",
                href: route("expenses.index"),
                match: "expenses.*",
            },
            {
                label: "Paiements",
                href: route("payments.index"),
                match: "payments.*",
            },
        ],
    },
    {
        label: "Gestion",
        items: [
            {
                label: "Tickets",
                href: route("tickets.index"),
                match: "tickets.*",
            },
            {
                label: "Objets perdus",
                href: route("items.index"),
                match: "items.*",
            },
            {
                label: "Annonces",
                href: route("announcements.index"),
                match: "announcements.*",
            },
            
            {
                label: "Documents",
                href: route("documents.index"),
                match: "documents.*",
            },
            {
                label: "Historique des actions",
                href: route("audit-logs.index"),
                match: "audit-logs.*",
            },
        ],
    },
];

const superAdminNavSections = [
    {
        label: "Plateforme",
        items: [
            {
                label: "Organisations",
                href: route("admin.organizations.index"),
                match: "admin.organizations.*",
            },
        ],
    },
];

const residentNavMatches = {
    Locataire: [
        "dashboard",
        "payments.*",
        "receipts.*",
        "tickets.*",
        "items.*",
        "announcements.*",
        "documents.*",
    ],
    Coproprietaire: [
        "dashboard",
        "charges.*",
        "payments.*",
        "receipts.*",
        "tickets.*",
        "items.*",
        "announcements.*",
        "documents.*",
    ],
};

function NavItem({ href, match, children, onNavigate }) {
    const active = route().current(match);

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm text-white font-medium transition ${
                active
                    ? "bg-white/12 text-white"
                    : "text-emerald-50/80 hover:bg-white/8 hover:text-white"
            }`}
        >
            <span
                className={`h-2 w-2 rounded-full  ${
                    active ? "bg-lime-300" : "bg-white/70"
                }`}
            />
            <span>{children}</span>
        </Link>
    );
}

function TopNavItem({ href, match, children, badge, onNavigate }) {
    const active = route().current(match);

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                active
                    ? "bg-[#0e3715] text-white shadow-sm"
                    : "bg-white text-slate-700 shadow-sm hover:bg-emerald-50 hover:text-[#0e3715]"
            }`}
        >
            <span>{children}</span>
            {typeof badge === "number" && badge > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default function AdminLayout({ title, subtitle, toolbar, children }) {
    const { auth, flash, notifications } = usePage().props;
    const user = auth?.user;
    const { isRtl } = useI18n();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const unreadNotifications = notifications?.unread || 0;
    const visibleNavSections =
        user?.role === "SuperAdmin"
            ? superAdminNavSections
            : user?.role === "Syndic"
              ? navSections
              : navSections
                    .map((section) => ({
                        ...section,
                        items: section.items.filter((item) =>
                            (
                                residentNavMatches[user?.role] || ["dashboard"]
                            ).includes(item.match),
                        ),
                    }))
                    .filter((section) => section.items.length > 0);
    const roleNote =
        user?.role === "SuperAdmin"
            ? "Pilotage des organisations, abonnements et revenus plateforme."
            : user?.role === "Locataire"
            ? "Annonces de l'immeuble et reclamations techniques."
            : user?.role === "Coproprietaire"
              ? "Solde personnel, appels de fonds, documents et incidents."
              : "Pilotage financier, charges mensuelles et suivi des urgences.";

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#c8c1b0] text-slate-900">
            {mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Fermer la navigation"
                    className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            <div className={`min-h-screen ${isRtl ? "lg:pr-[300px]" : "lg:pl-[300px]"}`}>
                <aside
                    className={`fixed inset-y-0 ${isRtl ? "right-0" : "left-0"} z-50 flex w-[min(86vw,19rem)] max-w-full flex-col gap-6 overflow-y-auto bg-[#0e3715] px-4 py-6 text-white shadow-2xl transition-transform duration-300 lg:w-[300px] lg:translate-x-0 lg:gap-8 lg:px-6 lg:py-8 lg:shadow-none ${
                        mobileNavOpen
                            ? "translate-x-0"
                            : isRtl
                              ? "translate-x-full"
                              : "-translate-x-full"
                    }`}
                >
                    <div className="flex items-start justify-between gap-4 lg:block">
                        <Link
                            href={route("dashboard")}
                            className="group block min-w-0 flex-1 rounded-[1.75rem] p-1 transition duration-300"
                            onClick={() => setMobileNavOpen(false)}
                        >
                            <div className="flex items-center gap-3 lg:block">
                                <div className="flex h-24 w-52 shrink-0 items-center justify-center sm:h-28 sm:w-56 lg:mx-auto lg:h-32 lg:w-full lg:max-w-[14rem]">
                                    <img
                                        src="/images/logo.png"
                                        alt="Logo SyndiCare"
                                        className="max-h-full w-auto object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>

                                <div className="min-w-0 lg:mt-3 lg:text-center">
                                  
                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-100/80 sm:text-xs">
                                        Console de gestion
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <button
                            type="button"
                            className="rounded-full border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 lg:hidden"
                            onClick={() => setMobileNavOpen(false)}
                        >
                            Fermer
                        </button>
                    </div>

                    <nav className="space-y-6">
                        {visibleNavSections.map((section) => (
                            <div key={section.label} className="space-y-2">
                                <p className="flex items-center rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-lime-50 shadow-sm sm:text-[13px]">
                                    {section.label}
                                </p>
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <NavItem
                                            key={item.label}
                                            href={item.href}
                                            match={item.match}
                                            onNavigate={() =>
                                                setMobileNavOpen(false)
                                            }
                                        >
                                            {item.label}
                                        </NavItem>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <LanguageSwitcher variant="dark" />

                    <div className="mt-auto rounded-[1.25rem] bg-white/10 p-3 backdrop-blur-sm sm:rounded-[1.5rem] sm:p-4">
                        <p className="text-sm font-semibold text-white">
                            {user?.name}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100/60 sm:text-xs">
                            {user?.role}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-emerald-100/65">
                            {roleNote}
                        </p>
                    </div>
                </aside>

                <div className="flex min-h-screen flex-col lg:pl-0">
                    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
                        <div className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between gap-3 border-b border-black/5 bg-[#f6f2e9]/95 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
                            <button
                                type="button"
                                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#10491d] shadow-sm"
                                onClick={() => setMobileNavOpen(true)}
                            >
                                Menu
                            </button>

                            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-center">
                                <span className="flex h-16 min-w-0 shrink items-center justify-center">
                                    <img
                                        src="/images/logomobile.png"
                                        alt="Logo SyndiCare"
                                        className="h-full w-auto max-w-[13rem] object-contain drop-shadow-[0_6px_10px_rgba(16,73,29,0.18)] sm:max-w-[15rem]"
                                    />
                                </span>
                                <p className="hidden truncate text-base font-semibold italic text-[#10491d] sm:block sm:text-lg">
                                    {title}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <LanguageSwitcher compact />
                                <NotificationDropdown
                                    notifications={notifications?.latest}
                                    unreadCount={unreadNotifications}
                                    triggerClassName="h-10 w-10"
                                />
                            </div>
                        </div>

                        <header
                            className={`relative z-30 mt-20 border-b border-black/5 bg-[#f6f2e9]/95 shadow-sm backdrop-blur lg:fixed ${
                                isRtl
                                    ? "lg:left-0 lg:right-[300px]"
                                    : "lg:left-[300px] lg:right-0"
                            } lg:top-0 lg:z-40 lg:mt-0`}
                        >
                            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-6 sm:py-5">
                                <div className="hidden items-center justify-between gap-4 lg:flex">
                                    <div className="min-w-0">
                                        <p className="text-2xl font-semibold  text-[#10491d] sm:text-3xl lg:text-4xl">
                                            {title}
                                        </p>
                                        {subtitle && (
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                                        <nav className="flex flex-wrap items-center gap-2">
                                            {/* <TopNavItem
                                                href={route('dashboard')}
                                                match="dashboard"
                                            >
                                                Tableau de bord
                                            </TopNavItem> */}

                                            <LanguageSwitcher />

                                            <NotificationDropdown
                                                notifications={
                                                    notifications?.latest
                                                }
                                                unreadCount={
                                                    unreadNotifications
                                                }
                                                triggerClassName="h-10 w-10"
                                            />
                                        </nav>

                                        {toolbar}

                                        <div className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button>
                                                        {
                                                            user?.name?.split(
                                                                " ",
                                                            )[0]
                                                        }
                                                    </button>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <Dropdown.Link
                                                        href={route(
                                                            "profile.edit",
                                                        )}
                                                    >
                                                        Profil
                                                    </Dropdown.Link>

                                                    <Dropdown.Link
                                                        href={route("logout")}
                                                        method="post"
                                                        as="button"
                                                    >
                                                        Deconnexion
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                            {/* <div className="text-xs text-slate-500">
                                                {user?.email}
                                            </div> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 lg:hidden">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:text-sm sm:tracking-[0.24em]">
                                            Syndicare
                                        </p>
                                        {subtitle && (
                                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>

                                    <div className="rounded-full border border-black/10 bg-white px-3 py-2 shadow-sm">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="text-xs font-semibold text-slate-900">
                                                    {user?.name?.split(" ")[0]}
                                                </button>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content align="right">
                                                <Dropdown.Link
                                                    href={route("profile.edit")}
                                                >
                                                    Profil
                                                </Dropdown.Link>

                                                <Dropdown.Link
                                                    href={route("logout")}
                                                    method="post"
                                                    as="button"
                                                >
                                                    Deconnexion
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>

                                {toolbar && (
                                    <div className="flex lg:hidden">
                                        {toolbar}
                                    </div>
                                )}
                            </div>
                        </header>

                        <div className="flex flex-1 flex-col lg:pt-[128px]">
                            {flash?.success && (
                                <div className="px-3 pt-3 sm:px-6">
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 shadow-sm">
                                        {flash.success}
                                    </div>
                                </div>
                            )}

                            {flash?.error && (
                                <div className="px-3 pt-3 sm:px-6">
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800 shadow-sm">
                                        {flash.error}
                                    </div>
                                </div>
                            )}

                            <main className="flex-1 px-3 py-3 sm:px-6 sm:py-6">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
