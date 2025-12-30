'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Locale } from '@/lib/i18n/request';

interface LoginFormProps {
    locale: Locale;
}

export function LoginForm({ locale }: LoginFormProps) {
    const t = useTranslations('auth');
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateForm = (): string | null => {
        if (!username) return t('message.usernameRequired');
        if (username.length < 5 || username.length > 10) return t('message.usernameLength');
        if (!password) return t('message.passwordRequired');
        if (password.length < 5 || password.length > 10) return t('message.passwordLength');
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('message.loginFailed'));
            } else {
                router.push(`/${locale}`);
                router.refresh();
            }
        } catch (err) {
            setError(t('message.serverError'));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-24">
            <GlassCard className="w-full max-w-md p-8" heavy hover={false}>
                {/* ... */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        {/* ... username input ... */}
                        <label className="block text-sm font-medium mb-2">
                            {t('label.username')}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full"
                            placeholder="5-10 characters"
                            maxLength={10}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('label.password')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full"
                                placeholder="5-10 characters"
                                maxLength={10}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-coral transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 014.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full btn-primary"
                        disabled={loading}
                    >
                        {loading ? '...' : t('button.login')}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-text-muted">{t('message.noAccount')} </span>
                        <Link href={`/${locale}/auth/register`} className="text-coral hover:underline">
                            {t('button.goToRegister')}
                        </Link>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
