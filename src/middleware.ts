import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/request';

export default createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

export const config = {
    matcher: ['/', '/(sc|tc|en)/:path*']
};
