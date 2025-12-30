import { setRequestLocale } from 'next-intl/server';
import { HSKList } from '@/components/hsk/HSKList';
import type { Locale } from '@/lib/i18n/request';
import { getHSKLevels } from '@/lib/actions/hsk';
import { auth } from '@/lib/auth';

type Params = { locale: string };

export default async function HSKPage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const typedLocale = locale as Locale;

    const { data: levels } = await getHSKLevels();
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    return (
        <HSKList
            locale={typedLocale}
            initialLevels={levels || []}
            isAdmin={isAdmin}
        />
    );
}
