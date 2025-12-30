import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['sc', 'tc', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  sc: '简体中文',
  tc: '繁體中文',
  en: 'English'
};

export const defaultLocale: Locale = 'sc';

// 消息映射
const messages: Record<Locale, () => Promise<Record<string, unknown>>> = {
  sc: () => import('../../../messages/sc.json').then((m) => m.default),
  tc: () => import('../../../messages/tc.json').then((m) => m.default),
  en: () => import('../../../messages/en.json').then((m) => m.default),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: await messages[locale as Locale]()
  };
});
