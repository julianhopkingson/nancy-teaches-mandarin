import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { HSKGrid } from '@/components/sections/HSKGrid';

type Params = {
    locale: string;
};

export default async function HomePage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const typedLocale = locale as 'sc' | 'tc' | 'en';

    return (
        <>
            <Hero locale={typedLocale} />
            <HSKGrid locale={typedLocale} />
        </>
    );
}
