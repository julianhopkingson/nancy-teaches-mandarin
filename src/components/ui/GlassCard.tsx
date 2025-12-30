'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    heavy?: boolean;
    hover?: boolean;
}

export function GlassCard({ children, className = '', heavy = false, hover = true }: GlassCardProps) {
    return (
        <div
            className={`${heavy ? 'glass-heavy' : 'glass'} ${hover ? 'hover:scale-[1.02] hover:-translate-y-1 transition-transform' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
