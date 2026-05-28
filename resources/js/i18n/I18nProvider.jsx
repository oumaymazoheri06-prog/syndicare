import { router } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { applyDomTranslations } from './dom';
import {
    getStoredLocale,
    languageOptions,
    localeDirection,
    normalizeLocale,
    translateText,
} from './translations';

const I18nContext = createContext({
    locale: 'fr',
    languages: languageOptions,
    direction: 'ltr',
    isRtl: false,
    changeLocale: () => {},
    t: (value) => value,
});

export function I18nProvider({ initialLocale = 'fr', children }) {
    const [locale, setLocale] = useState(() =>
        normalizeLocale(initialLocale || getStoredLocale()),
    );

    useEffect(() => {
        const direction = localeDirection(locale);

        document.documentElement.lang = locale;
        document.documentElement.dir = direction;
        document.body.dir = direction;
        document.body.classList.toggle('rtl', direction === 'rtl');
        window.localStorage.setItem('locale', locale);

        let frame = window.requestAnimationFrame(() =>
            applyDomTranslations(locale),
        );

        const scheduleTranslation = () => {
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() =>
                applyDomTranslations(locale),
            );
        };

        const observer = new MutationObserver(scheduleTranslation);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
        });

        const removeFinishListener = router.on('finish', scheduleTranslation);

        return () => {
            window.cancelAnimationFrame(frame);
            observer.disconnect();
            removeFinishListener();
        };
    }, [locale]);

    const changeLocale = useCallback(
        (nextLocale) => {
            const normalized = normalizeLocale(nextLocale);

            if (normalized === locale) {
                return;
            }

            setLocale(normalized);
            window.localStorage.setItem('locale', normalized);

            router.post(
                route('language.update'),
                { locale: normalized },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => setLocale(locale),
                },
            );
        },
        [locale],
    );

    const value = useMemo(
        () => ({
            locale,
            languages: languageOptions,
            direction: localeDirection(locale),
            isRtl: localeDirection(locale) === 'rtl',
            changeLocale,
            t: (text) => translateText(text, locale),
        }),
        [changeLocale, locale],
    );

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
