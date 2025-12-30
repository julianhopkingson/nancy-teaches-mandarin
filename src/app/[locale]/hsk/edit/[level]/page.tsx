import { setRequestLocale } from 'next-intl/server';
import { getHSKLevels } from '@/lib/actions/hsk';
import { HSKLevelEditClient } from './HSKLevelEditClient';
import { notFound } from 'next/navigation';
import type { Locale } from '@/lib/i18n/request';

type Params = { locale: string; level: string };

export default async function HSKEditPage({ params }: { params: Promise<Params> }) {
    const { locale, level } = await params;
    setRequestLocale(locale);
    const typedLocale = locale as Locale;

    const { data: levels } = await getHSKLevels();
    const hskLevel = levels?.find((l: any) => l.level === parseInt(level));

    if (!hskLevel) {
        notFound();
    }

    return (
        <HSKLevelEditClient
            locale={typedLocale}
            hskLevel={hskLevel}
        />
    );
}
