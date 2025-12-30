'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import type { Locale } from '@/lib/i18n/request';

interface HeaderProps {
    locale: Locale;
}

export function Header({ locale }: HeaderProps) {
    const t = useTranslations('nav');
    const tAuth = useTranslations('auth');
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isLoggedIn = status === 'authenticated' && session?.user;
    const isAdmin = isLoggedIn && session.user.role === 'admin';

    const navLinks = [
        { href: `/${locale}`, label: t('home') },
        { href: `/${locale}/hsk`, label: t('hsk') },
        { href: `/${locale}/about`, label: t('about') },
    ];

    const handleLogout = async () => {
        await signOut({ callbackUrl: `/${locale}` });
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-4 mt-4">
                <nav className="glass-heavy px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center text-white font-bold text-xl shadow-lg hover:scale-110 hover:rotate-6 transition-transform">
                            N
                        </div>
                        <span className="font-bold text-lg hidden sm:block">
                            Nancy <span className="text-coral">教你学汉语</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-text-secondary hover:text-coral transition-colors font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link
                                href={`/${locale}/admin`}
                                className="text-coral hover:text-coral-dark transition-colors font-medium"
                            >
                                {t('admin')}
                            </Link>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <LanguageToggle currentLocale={locale} />

                        {isLoggedIn ? (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link
                                    href={`/${locale}/profile`}
                                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-coral transition-colors"
                                >
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold text-sm">
                                            {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span>{session.user.name || session.user.email}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm px-4 py-2 hover:scale-105 active:scale-95 transition-transform"
                                >
                                    {tAuth('logout')}
                                </button>
                            </div>
                        ) : (
                            <Link href={`/${locale}/auth/login`}>
                                <button className="btn-primary hidden sm:block hover:scale-105 active:scale-95 transition-transform">
                                    {t('login')}
                                </button>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden mx-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-ivory-cream/80 dark:bg-[#1a1a2e]/80 backdrop-blur-xl p-4 flex flex-col gap-4 rounded-2xl border border-white/30 shadow-xl">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-text-primary hover:text-coral transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAdmin && (
                            <Link
                                href={`/${locale}/admin`}
                                className="text-coral hover:text-coral-dark transition-colors font-medium py-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {t('admin')}
                            </Link>
                        )}

                        {isLoggedIn ? (
                            <>
                                <Link
                                    href={`/${locale}/profile`}
                                    className="flex items-center gap-2 text-text-secondary hover:text-coral transition-colors py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold text-sm">
                                        {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                                    </div>
                                    <span>{session.user.name || session.user.email}</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="btn-secondary w-full"
                                >
                                    {tAuth('logout')}
                                </button>
                            </>
                        ) : (
                            <Link href={`/${locale}/auth/login`} onClick={() => setIsMobileMenuOpen(false)}>
                                <button className="btn-primary w-full">
                                    {t('login')}
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
