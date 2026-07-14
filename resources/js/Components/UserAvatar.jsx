import { useEffect, useState } from 'react';

const sizeClasses = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-2xl',
};

function initialsFor(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) {
        return 'U';
    }

    return parts.map((part) => part.charAt(0)).join('').toUpperCase();
}

export default function UserAvatar({
    user,
    name,
    src,
    size = 'sm',
    className = '',
}) {
    const displayName = name ?? user?.name ?? '';
    const imageSrc = src ?? user?.profile_photo_url ?? null;
    const [imageFailed, setImageFailed] = useState(false);
    const classes = sizeClasses[size] ?? sizeClasses.sm;

    useEffect(() => {
        setImageFailed(false);
    }, [imageSrc]);

    if (imageSrc && !imageFailed) {
        return (
            <img
                src={imageSrc}
                alt={displayName ? `Photo de ${displayName}` : 'Photo de profil'}
                className={`${classes} shrink-0 rounded-full object-cover ring-1 ring-slate-200 ${className}`}
                onError={() => setImageFailed(true)}
            />
        );
    }

    return (
        <span
            className={`${classes} inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-[#0F5132] ring-1 ring-emerald-200 ${className}`}
            title={displayName || undefined}
        >
            {initialsFor(displayName)}
        </span>
    );
}
