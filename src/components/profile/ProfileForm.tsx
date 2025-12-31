'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Locale } from '@/lib/i18n/request';
import { AvatarUploadModal } from './AvatarUploadModal';
import { uploadAvatar } from '@/actions/profile';

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

    // Avatar State
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [originalFilename, setOriginalFilename] = useState<string>('avatar.jpg');

    // Refresh display name on session update
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
                await update({ displayName });
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Size validation (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit. (文件大小超过2MB限制)');
                e.target.value = ''; // Reset input
                return;
            }

            setOriginalFilename(file.name);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result?.toString() || null);
                setShowAvatarModal(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = async (file: File) => {
        try {
            const formData = new FormData();
            // Append file with original name (or what canvasUtils gave us, but we prefer original name stem)
            // canvasUtils gives 'avatar.jpg', we want to try to keep extension or just use original name
            // But 'file' from canvasUtils is a blob with 'avatar.jpg' name.
            // We can rename it in FormData.
            formData.append('file', file, originalFilename);

            const result = await uploadAvatar(formData);

            setMessage({ type: 'success', text: t('message.updateSuccess') });
            // Close modal
            setShowAvatarModal(false);
            setSelectedImage(null);
            // Refresh session/page
            if (result.url) {
                await update({ avatar: result.url });
            } else {
                await update();
            }
            router.refresh();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: t('message.updateFailed') });
        }
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
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                                <input
                                    type="file"
                                    id="avatar-input"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                                {session.user.image ? (
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-coral transition-colors">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center text-coral font-bold text-3xl border-2 border-transparent group-hover:border-coral transition-colors">
                                        {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
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

            {showAvatarModal && selectedImage && (
                <AvatarUploadModal
                    imageSrc={selectedImage}
                    onClose={() => {
                        setShowAvatarModal(false);
                        setSelectedImage(null);
                    }}
                    onSave={handleSaveAvatar}
                />
            )}
        </div>
    );
}
