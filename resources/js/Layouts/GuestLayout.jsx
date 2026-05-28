import {
    authCardClass,
    authOverlayClass,
    authPageClass,
    authShellClass,
} from './authStyles';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nProvider';

export default function GuestLayout({ children }) {
    const { isRtl } = useI18n();

    return (
        <div className={authPageClass}>
            <img
                src="/changer-de-syndic.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className={authOverlayClass} />

            <div
                className={`absolute top-4 z-20 hidden sm:block ${
                    isRtl ? 'left-4' : 'right-4'
                }`}
            >
                <LanguageSwitcher compact />
            </div>

            <div className={authShellClass}>
                <div className={authCardClass}>{children}</div>
            </div>
        </div>
    );
}
