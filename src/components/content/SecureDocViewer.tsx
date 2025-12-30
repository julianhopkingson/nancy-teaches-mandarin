'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface SecureDocViewerProps {
    url: string;
    title: string;
}

export function SecureDocViewer({ url, title }: SecureDocViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 禁用右键菜单
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 禁用键盘快捷键
        const handleKeyDown = (e: KeyboardEvent) => {
            // 禁用 Ctrl+S, Ctrl+P, Ctrl+C 等
            if (e.ctrlKey && ['s', 'p', 'c', 'u'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            // 禁用 F12
            if (e.key === 'F12') {
                e.preventDefault();
            }
        };

        container.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <GlassCard className="p-4" hover={false}>
            <h3 className="font-bold mb-4">{title}</h3>
            <div
                ref={containerRef}
                className="relative w-full h-[600px] rounded-xl overflow-hidden select-none"
                style={{ userSelect: 'none' }}
            >
                <iframe
                    src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full pointer-events-auto"
                    style={{ pointerEvents: 'auto' }}
                    title={title}
                />
                {/* 透明遮罩防止直接下载 */}
                <div className="absolute inset-0 pointer-events-none" />
            </div>
            <p className="text-text-muted text-sm mt-2 text-center">
                📖 在线阅读模式 | Online Reading Mode
            </p>
        </GlassCard>
    );
}
