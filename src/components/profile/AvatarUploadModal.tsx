'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { getCroppedImg } from '@/utils/canvasUtils';
import { useTranslations } from 'next-intl';

interface AvatarUploadModalProps {
    imageSrc: string;
    onClose: () => void;
    onSave: (file: File) => void;
}

export function AvatarUploadModal({ imageSrc, onClose, onSave }: AvatarUploadModalProps) {
    const t = useTranslations('profile');
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [loading, setLoading] = useState(false);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setLoading(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onSave(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // 禁止背景滚动
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-4 border-b dark:border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold">{t('modal.editAvatar')}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative h-64 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        cropShape="round"
                        showGrid={false}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-coral"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                        >
                            {t('button.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="btn-primary px-6 py-2 text-sm"
                        >
                            {loading ? '...' : t('button.saveAvatar')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
