import { setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/auth/LoginForm';
import type { Locale } from '@/lib/i18n/request';

type Params = { locale: string };

export default async function LoginPage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const typedLocale = locale as Locale;

    return <LoginForm locale={typedLocale} />;
}
