import { setRequestLocale } from 'next-intl/server';
import { HSKDetail } from '@/components/hsk/HSKDetail';
import { locales } from '@/lib/i18n/request';
import type { Locale } from '@/lib/i18n/request';

type Params = { locale: string; level: string };

export function generateStaticParams() {
    const levels = [1, 2, 3, 4, 5, 6];
    return locales.flatMap((locale) =>
        levels.map((level) => ({ locale, level: String(level) }))
    );
}

import { getLessons } from '@/lib/actions/lesson';

import { auth } from '@/lib/auth';

export default async function HSKLevelPage({ params }: { params: Promise<Params> }) {
    const { locale, level } = await params;
    setRequestLocale(locale);

    const typedLocale = locale as Locale;
    const levelNum = parseInt(level, 10) as 1 | 2 | 3 | 4 | 5 | 6;

    const [session, lessons] = await Promise.all([
        auth(),
        getLessons(levelNum),
    ]);

    const isAdmin = session?.user?.role === 'admin';

    return <HSKDetail level={levelNum} locale={typedLocale} lessons={lessons} isAdmin={isAdmin} />;
}
