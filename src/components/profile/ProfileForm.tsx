'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Locale } from '@/lib/i18n/request';

interface ProfileFormProps {
    locale: Locale;
}

export function ProfileForm({ locale }: ProfileFormProps) {
    const t = useTranslations('profile');
    const tAuth = useTranslations('auth');
    const { data: session, update } = useSession();
    const router = useRouter();

    const [displayName, setDisplayName] = useState(session?.user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (session?.user?.name) {
            setDisplayName(session.user.name);
        }
    }, [session?.user?.name]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: t('message.updateSuccess') });
                await update();
                router.refresh();
            } else {
                setMessage({ type: 'error', text: t('message.updateFailed') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('message.updateFailed') });
        }
        setLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: t('message.passwordMismatch') });
            setLoading(false);
            return;
        }

        if (newPassword.length < 5 || newPassword.length > 10) {
            setMessage({ type: 'error', text: t('message.passwordLength') });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/profile/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: t('message.passwordChanged') });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                if (data.error === 'WRONG_PASSWORD') {
                    setMessage({ type: 'error', text: t('message.wrongPassword') });
                } else {
                    setMessage({ type: 'error', text: t('message.updateFailed') });
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('message.updateFailed') });
        }
        setLoading(false);
    };

    if (!session?.user) {
        return null;
    }

    return (
        <div className="min-h-screen pt-32 px-4 pb-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">{t('title')}</h1>

                {message && (
                    <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Info */}
                <GlassCard className="p-6" heavy hover={false}>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold text-3xl">
                                {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-lg">{session.user.name || session.user.email}</p>
                                <p className="text-text-muted text-sm">{session.user.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t('label.displayName')}
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full"
                                maxLength={20}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? '...' : t('button.saveChanges')}
                        </button>
                    </form>
                </GlassCard>

                {/* Change Password */}
                <GlassCard className="p-6" heavy hover={false}>
                    <h2 className="text-xl font-bold mb-4">{t('button.changePassword')}</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t('label.currentPassword')}
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full"
                                maxLength={10}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t('label.newPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full"
                                    placeholder="5-10 characters"
                                    maxLength={10}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-coral transition-colors"
                                >
                                    {showNewPassword ? (
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

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t('label.confirmNewPassword')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full"
                                    placeholder="5-10 characters"
                                    maxLength={10}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-coral transition-colors"
                                >
                                    {showConfirmPassword ? (
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

                        <button
                            type="submit"
                            className="btn-secondary"
                            disabled={loading}
                        >
                            {loading ? '...' : t('button.changePassword')}
                        </button>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
}
