import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { locales } from '@/lib/i18n/request';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import "../globals.css";

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter'
});

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: "Nancy 教你学汉语 | Nancy Teaches Mandarin",
    description: "用真正有效的方法学习中文 - Learn Mandarin with methods that actually work",
};

type Params = {
    locale: string;
};

// 将 locale 映射到标准 HTML lang 属性
function getHtmlLang(locale: string): string {
    const langMap: Record<string, string> = {
        sc: 'zh-Hans',
        tc: 'zh-Hant',
        en: 'en',
    };
    return langMap[locale] || 'en';
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<Params>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const messages = await getMessages();
    const typedLocale = locale as 'sc' | 'tc' | 'en';
    const htmlLang = getHtmlLang(locale);

    return (
        <html lang={htmlLang} suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                <SessionProvider>
                    <NextIntlClientProvider messages={messages}>
                        <div className="min-h-screen flex flex-col">
                            <Header locale={typedLocale} />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Footer locale={typedLocale} />
                        </div>
                    </NextIntlClientProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
