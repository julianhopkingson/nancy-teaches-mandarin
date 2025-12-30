import { setRequestLocale } from 'next-intl/server';
import { HSKList } from '@/components/hsk/HSKList';
import type { Locale } from '@/lib/i18n/request';

type Params = { locale: string };

export default async function HSKPage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const typedLocale = locale as Locale;

    return <HSKList locale={typedLocale} />;
}
