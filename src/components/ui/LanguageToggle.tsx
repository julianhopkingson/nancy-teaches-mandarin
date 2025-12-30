'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/lib/i18n/request';

export function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
    const pathname = usePathname();
    const router = useRouter();

    const switchLocale = (newLocale: Locale) => {
        const segments = pathname.split('/');
        segments[1] = newLocale;
        router.push(segments.join('/'));
    };

    return (
        <div className="flex items-center gap-1 p-1 rounded-full glass">
            {locales.map((locale) => (
                <button
                    key={locale}
                    onClick={() => switchLocale(locale)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 ${currentLocale === locale
                            ? 'bg-coral text-white shadow-md'
                            : 'text-text-secondary hover:text-coral'
                        }`}
                >
                    {locale === 'sc' ? '简' : locale === 'tc' ? '繁' : 'EN'}
                </button>
            ))}
        </div>
    );
}
