import Dropdown from '@/Components/Dropdown';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function getTone(type) {
    if (type === 'warning') {
        return 'bg-amber-500';
    }

    if (type === 'error') {
        return 'bg-rose-500';
    }

    return 'bg-emerald-500';
}

const bellIcon = String.fromCodePoint(0x1f514);
const sparkleIcon = String.fromCodePoint(0x2728);

export default function NotificationDropdown({
    notifications = [],
    unreadCount = 0,
    triggerClassName = '',
    contentClassName = '',
}) {
    const latest = Array.isArray(notifications) ? notifications : [];
    const [visibleUnreadCount, setVisibleUnreadCount] = useState(unreadCount);
    const [visibleNotifications, setVisibleNotifications] = useState(latest);

    useEffect(() => {
        setVisibleUnreadCount(unreadCount);
        setVisibleNotifications(latest);
    }, [notifications, unreadCount]);

    const markAllAsReadWhenOpened = () => {
        if (visibleUnreadCount === 0) {
            return;
        }

        setVisibleUnreadCount(0);
        setVisibleNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                is_read: true,
            })),
        );

        router.patch(
            route('notifications.mark-all-read'),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['notifications'],
                onError: () => {
                    setVisibleUnreadCount(unreadCount);
                    setVisibleNotifications(latest);
                },
            },
        );
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    onClick={markAllAsReadWhenOpened}
                    className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-sm transition hover:bg-emerald-50 hover:text-[#0e3715] focus:outline-none focus:ring-2 focus:ring-[#0e3715]/20 sm:h-11 sm:w-11 sm:text-xl ${triggerClassName}`}
                    aria-label="Ouvrir les alertes"
                >
                    <span aria-hidden="true">{bellIcon}</span>
                    {visibleUnreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                            {visibleUnreadCount}
                        </span>
                    )}
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="right"
                width="auto"
                contentClasses={`w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-0 shadow-2xl sm:w-[26rem] sm:rounded-[1.5rem] ${contentClassName}`}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Dernieres alertes
                        </p>
                        <p className="text-xs text-slate-500">
                            {visibleUnreadCount > 0
                                ? `${visibleUnreadCount} non lue${visibleUnreadCount > 1 ? 's' : ''}`
                                : 'Tout est a jour'}
                        </p>
                    </div>
                    <span className="text-lg" aria-hidden="true">
                        {sparkleIcon}
                    </span>
                </div>

                <div className="max-h-[20rem] divide-y divide-slate-100 overflow-y-auto sm:max-h-[24rem]">
                    {visibleNotifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-500">
                            Aucune alerte pour le moment.
                        </div>
                    ) : (
                        visibleNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-3 py-3 transition sm:px-4 ${
                                        notification.is_read ? 'bg-white' : 'bg-emerald-50/60'
                                    } hover:bg-slate-50`}
                                >
                                    <div className="flex items-start gap-2.5 sm:gap-3">
                                        <span
                                            className={`mt-1 h-2.5 w-2.5 rounded-full ${getTone(
                                                notification.type,
                                            )}`}
                                        />

                                        <Link
                                            href={route('notifications.show', notification.id)}
                                            className="min-w-0 flex-1 text-left"
                                        >
                                            <div className="flex items-start justify-between gap-2.5">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                                                        Nouveau
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                                                {notification.message}
                                            </p>

                                            <p className="mt-2 text-xs text-slate-400">
                                                {notification.created_at}
                                            </p>
                                        </Link>

                                        {!notification.is_read && (
                                            <Link
                                                href={route('notifications.mark-read', notification.id)}
                                                method="patch"
                                                as="button"
                                                preserveScroll
                                                className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 transition hover:bg-emerald-200 sm:px-3 sm:text-[11px]"
                                            >
                                                Lu
                                            </Link>
                                        )}
                                    </div>
                                </div>
                        ))
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3 py-3 sm:px-4">
                    <Link
                        href={route('notifications.index')}
                        className="text-xs font-semibold text-[#0e3715] transition hover:text-[#153f1c] sm:text-sm"
                    >
                        Tout voir
                    </Link>

                    {visibleUnreadCount > 0 && (
                        <Link
                            href={route('notifications.mark-all-read')}
                            method="patch"
                            as="button"
                            preserveScroll
                            className="rounded-full border border-emerald-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 transition hover:bg-emerald-50 sm:px-3 sm:text-[11px]"
                        >
                            Tout marquer comme lu
                        </Link>
                    )}
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
