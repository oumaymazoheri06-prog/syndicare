import NotificationDropdown from "@/Components/NotificationDropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import Dropdown from "@/Components/Dropdown";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import UserAvatar from "@/Components/UserAvatar";
import { useI18n } from "@/i18n/I18nProvider";
const navSections = [
    {
        label: "Principal",
        items: [
            {
                label: "Tableau de bord",
                href: route("dashboard"),
                match: "dashboard",
                icon: "dashboard",
            },
            {
                label: "Immeubles",
                href: route("buildings.index"),
                match: "buildings.*",
                icon: "buildings",
            },
            {
                label: "Lots",
                href: route("apartments.index"),
                match: "apartments.*",
                icon: "lots",
            },
            {
                label: "Membres",
                href: route("users.index"),
                match: "users.*",
                icon: "users",
            },
        ],
    },
    {
        label: "Finance",
        items: [
            {
                label: "Charges",
                href: route("charges.index"),
                match: "charges.*",
                icon: "charges",
            },
            {
                label: "Paiements",
                href: route("payments.index"),
                match: "payments.*",
                icon: "payments",
            },
            {
                label: "Dépenses",
                href: route("expenses.index"),
                match: "expenses.*",
                icon: "expenses",
            },
        ],
    },
    {
        label: "Communication",
        items: [
            {
                label: "Documents",
                href: route("documents.index"),
                match: "documents.*",
                icon: "documents",
            },
            {
                label: "Annonces",
                href: route("announcements.index"),
                match: "announcements.*",
                icon: "announcements",
            },
            {
                label: "Tickets",
                href: route("tickets.index"),
                match: "tickets.*",
                icon: "tickets",
            },
        ],
    },
    {
        label: "Plus",
        items: [
            {
                label: "Objets perdus",
                href: route("items.index"),
                match: "items.*",
                icon: "items",
            },
            {
                label: "Historique",
                href: route("audit-logs.index"),
                match: "audit-logs.*",
                icon: "history",
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
                icon: "buildings",
            },
        ],
    },
];

const residentNavMatches = {
    Locataire: [
        "dashboard",
        "tickets.*",
        "items.*",
        "announcements.*",
        "documents.*",
    ],
    Coproprietaire: [
        "dashboard",
        "charges.*",
        "payments.*",
        "expenses.*",
        "tickets.*",
        "items.*",
        "announcements.*",
        "documents.*",
    ],
};

function NavIcon({ name }) {
    const icons = {
        dashboard: (
            <>
                <path d="M4 4h7v7H4z" />
                <path d="M13 4h7v4h-7z" />
                <path d="M13 10h7v10h-7z" />
                <path d="M4 13h7v7H4z" />
            </>
        ),
        buildings: (
            <>
                <path d="M5 20V5l9-2v17" />
                <path d="M14 8h5v12" />
                <path d="M8 8h2" />
                <path d="M8 12h2" />
                <path d="M8 16h2" />
            </>
        ),
        lots: (
            <>
                <path d="M4 10.5 12 4l8 6.5" />
                <path d="M6 10v10h12V10" />
                <path d="M10 20v-6h4v6" />
            </>
        ),
        users: (
            <>
                <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                <path d="M3 21a6 6 0 0 1 12 0" />
                <path d="M17 9a3 3 0 1 0 0-6" />
                <path d="M17 14a5 5 0 0 1 4 5" />
            </>
        ),
        charges: (
            <>
                <path d="M4 7h16" />
                <path d="M6 7V5h12v2" />
                <path d="M7 11h10" />
                <path d="M7 15h6" />
                <path d="M6 19h12" />
            </>
        ),
        payments: (
            <>
                <path d="M3 7h18v10H3z" />
                <path d="M3 10h18" />
                <path d="M7 15h4" />
            </>
        ),
        expenses: (
            <>
                <path d="M12 3v18" />
                <path d="M17 7H9.5a3 3 0 0 0 0 6H14a3 3 0 0 1 0 6H6" />
            </>
        ),
        documents: (
            <>
                <path d="M7 3h7l4 4v14H7z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6" />
                <path d="M9 17h6" />
            </>
        ),
        announcements: (
            <>
                <path d="M4 13h4l9 5V6l-9 5H4z" />
                <path d="M8 13v5" />
                <path d="M19 10a3 3 0 0 1 0 4" />
            </>
        ),
        tickets: (
            <>
                <path d="M5 5h14v4a3 3 0 0 0 0 6v4H5v-4a3 3 0 0 0 0-6z" />
                <path d="M12 8v8" />
            </>
        ),
        items: (
            <>
                <path d="M4 7h16v13H4z" />
                <path d="M8 7a4 4 0 0 1 8 0" />
                <path d="M9 13h6" />
            </>
        ),
        history: (
            <>
                <path d="M4 12a8 8 0 1 0 2.3-5.7" />
                <path d="M4 5v5h5" />
                <path d="M12 8v5l3 2" />
            </>
        ),
    };

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            {icons[name] ?? icons.dashboard}
        </svg>
    );
}

function NavItem({ href, match, icon, children, onNavigate }) {
    const active = route().current(match);

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition duration-200 ${
                active
                    ? "border-white/30 bg-white text-[#0F5132] shadow-[0_12px_26px_rgba(0,0,0,0.16)]"
                    : "border-transparent text-emerald-50/78 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 hover:text-white hover:shadow-[0_10px_22px_rgba(0,0,0,0.14)]"
            }`}
        >
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200 ${
                    active
                        ? "bg-[#0F5132] text-lime-200"
                        : "bg-white/8 text-emerald-50/80 group-hover:bg-lime-300 group-hover:text-[#0F5132]"
                }`}
            >
                <NavIcon name={icon} />
            </span>
            <span className="min-w-0 truncate">{children}</span>
            {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime-400" />
            )}
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
                    ? "bg-[#0F5132] text-white shadow-sm"
                    : "bg-white text-slate-700 shadow-sm hover:bg-emerald-50 hover:text-[#0F5132]"
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
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900">
            {mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Fermér la navigation"
                    className="fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            <div
                className={`min-h-screen ${isRtl ? "lg:pr-[260px]" : "lg:pl-[260px]"}`}
            >
                <aside
                    className={`fixed inset-y-0 ${isRtl ? "right-0" : "left-0"} z-50 flex w-[min(86vw,19rem)] max-w-full flex-col gap-5 overflow-y-auto bg-[#0F5132] px-4 py-5 text-white shadow-2xl transition-transform duration-300 lg:w-[260px] lg:translate-x-0 lg:gap-5 lg:px-4 lg:py-6 lg:shadow-none ${
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
                                <div className="flex h-20 w-44 shrink-0 items-center justify-center sm:h-24 sm:w-48 lg:mx-auto lg:h-24 lg:w-full lg:max-w-[11rem]">
                                    <img
                                        src="/images/logo.png"
                                        alt="Logo SyndiCare"
                                        className="max-h-full w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] transition duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>

                                <div className="min-w-0 lg:mt-2 lg:text-center">
                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-100/80">
                                        Console de gestion
                                    </p>
                                </div>
                            </div>
                        </Link>

                        <button
                            type="button"
                            aria-label="Fermer la navigation"
                            onClick={() => setMobileNavOpen(false)}
                            className={`absolute top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 lg:hidden ${
                                isRtl ? "left-4" : "right-4"
                            }`}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path
                                    d="M6 6l12 12M18 6L6 18"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-4">
                        {visibleNavSections.map((section) => (
                            <div key={section.label} className="space-y-1.5">
                                <p className="px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lime-100/60">
                                    {section.label}
                                </p>
                                <div className="space-y-1.5">
                                    {section.items.map((item) => (
                                        <NavItem
                                            key={item.label}
                                            href={item.href}
                                            match={item.match}
                                            icon={item.icon}
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

                    <div className="mt-auto rounded-xl border border-white/10 bg-white/8 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <UserAvatar
                                user={user}
                                size="md"
                                className="ring-white/30"
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    {user?.name}
                                </p>
                                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100/60">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 lg:hidden"
                    >
                        Déconnexion
                    </Link>
                </aside>

                <div className="flex min-h-screen flex-col lg:pl-0">
                    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
                        <div className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur lg:hidden">
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
                            className={`relative z-30 mt-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur lg:fixed ${
                                isRtl
                                    ? "lg:left-0 lg:right-[260px]"
                                    : "lg:left-[260px] lg:right-0"
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
                                                    <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                        <UserAvatar
                                                            user={user}
                                                            size="xs"
                                                        />
                                                        <span>
                                                            {
                                                                user?.name?.split(
                                                                    " ",
                                                                )[0]
                                                            }
                                                        </span>
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
                                                        Déconnexion
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
                                                <button className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900">
                                                    <UserAvatar
                                                        user={user}
                                                        size="xs"
                                                    />
                                                    <span>
                                                        {
                                                            user?.name?.split(
                                                                " ",
                                                            )[0]
                                                        }
                                                    </span>
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
                                                    Déconnexion
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
