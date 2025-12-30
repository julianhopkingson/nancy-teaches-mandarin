import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { HSKGrid } from '@/components/sections/HSKGrid';
import { getHSKLevels } from '@/lib/actions/hsk';
import { auth } from '@/lib/auth';

type Params = {
    locale: string;
};

export default async function HomePage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const typedLocale = locale as 'sc' | 'tc' | 'en';

    // Fetch unified HSK data
    const { data: initialLevels } = await getHSKLevels();
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    return (
        <>
            <Hero locale={typedLocale} />
            <HSKGrid
                locale={typedLocale}
                initialLevels={initialLevels || []}
                isAdmin={isAdmin}
            />
        </>
    );
}
