import {
    authCardClass,
    authOverlayClass,
    authPageClass,
    authShellClass,
} from './authStyles';

export default function GuestLayout({ children }) {
    return (
        <div className={authPageClass}>
            <img
                src="/changer-de-syndic.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className={authOverlayClass} />

            <div className={authShellClass}>
                <div className={authCardClass}>{children}</div>
            </div>
        </div>
    );
}
