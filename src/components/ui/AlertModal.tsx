'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertModalProps {
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onClose: () => void;
    buttonText?: string;
}

const icons = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
    ),
};

const colors = {
    success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-500', button: 'bg-green-500 hover:bg-green-600' },
    error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500', button: 'bg-red-500 hover:bg-red-600' },
    warning: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-500', button: 'bg-yellow-500 hover:bg-yellow-600' },
    info: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-500', button: 'bg-blue-500 hover:bg-blue-600' },
};

export function AlertModal({
    isOpen,
    type,
    title,
    message,
    onClose,
    buttonText = '确定',
}: AlertModalProps) {
    const color = colors[type];
    const icon = icons[type];

    // 禁止背景滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto text-center">
                            {/* Icon */}
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${color.bg} flex items-center justify-center ${color.text}`}>
                                {icon}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-text-primary mb-2">
                                {title}
                            </h3>

                            {/* Message */}
                            <p className="text-text-secondary text-sm mb-6">
                                {message}
                            </p>

                            {/* Button */}
                            <button
                                onClick={onClose}
                                className={`px-6 py-2.5 rounded-xl ${color.button} text-white font-medium transition-colors`}
                            >
                                {buttonText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
