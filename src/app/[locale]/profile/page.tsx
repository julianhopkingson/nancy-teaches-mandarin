import { setRequestLocale } from 'next-intl/server';
import { ProfileForm } from '@/components/profile/ProfileForm';
import type { Locale } from '@/lib/i18n/request';

type Params = { locale: string };

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const typedLocale = locale as Locale;

    return <ProfileForm locale={typedLocale} />;
}
