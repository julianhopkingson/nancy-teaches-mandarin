import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/request';

interface FooterProps {
    locale: Locale;
}

export function Footer({ locale }: FooterProps) {
    const t = useTranslations('footer');

    return (
        <footer className="py-8 px-4 border-t border-white/10">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center text-white font-bold">
                        N
                    </div>
                    <span className="text-text-muted text-sm">
                        {t('copyright')}
                    </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-text-muted">
                    <Link href={`/${locale}/privacy`} className="hover:text-coral transition-colors">
                        {t('privacy')}
                    </Link>
                    <Link href={`/${locale}/terms`} className="hover:text-coral transition-colors">
                        {t('terms')}
                    </Link>
                </div>
            </div>
        </footer>
    );
}
