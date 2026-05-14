import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NotificationDropdown from '@/Components/NotificationDropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash, notifications } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="flex h-14 justify-between sm:h-16">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3 flex items-center gap-2 sm:gap-3">
                                <NotificationDropdown
                                    notifications={notifications?.latest}
                                    unreadCount={notifications?.unread || 0}
                                    triggerClassName="h-10 w-10 sm:h-11 sm:w-11"
                                />



                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-full border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-1 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-full p-2.5 text-gray-500 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-700 focus:bg-gray-100 focus:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200 dark:focus:bg-gray-900 dark:focus:text-gray-200"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 px-2 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-3 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <div className="px-4 pb-1">
                                <NotificationDropdown
                                    notifications={notifications?.latest}
                                    unreadCount={notifications?.unread || 0}
                                    triggerClassName="h-10 w-10"
                                />
                            </div>
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {flash?.success && (
                <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                        {flash.success}
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {flash.error}
                    </div>
                </div>
            )}

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="px-3 py-4 sm:px-0 sm:py-0">{children}</main>
        </div>
    );
}
