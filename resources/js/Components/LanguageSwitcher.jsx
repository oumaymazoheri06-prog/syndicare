import { useI18n } from '@/i18n/I18nProvider';

const variantClasses = {
    light: {
        shell: 'border-black/10 bg-white text-slate-700 shadow-sm',
        active: 'bg-[#0e3715] text-white',
        idle: 'hover:bg-emerald-50 hover:text-[#0e3715]',
    },
    dark: {
        shell: 'border-white/15 bg-white/10 text-white shadow-sm',
        active: 'bg-white text-[#0e3715]',
        idle: 'text-white/80 hover:bg-white/15 hover:text-white',
    },
};

export default function LanguageSwitcher({
    variant = 'light',
    compact = false,
    className = '',
}) {
    const { locale, languages, changeLocale, t } = useI18n();
    const styles = variantClasses[variant] ?? variantClasses.light;

    return (
        <div
            className={`inline-flex max-w-full shrink-0 items-center gap-1 rounded-full border p-1 ${styles.shell} ${className}`}
            role="group"
            aria-label={t('Langue')}
        >
            {languages.map((language) => {
                const active = language.code === locale;

                return (
                    <button
                        key={language.code}
                        type="button"
                        onClick={() => changeLocale(language.code)}
                        className={`rounded-full font-bold transition ${
                            compact
                                ? 'px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs'
                                : 'px-2.5 py-1.5 text-xs sm:px-3'
                        } ${
                            active ? styles.active : styles.idle
                        }`}
                        aria-pressed={active}
                        title={language.native}
                    >
                        {compact ? language.code.toUpperCase() : language.native}
                    </button>
                );
            })}
        </div>
    );
}
