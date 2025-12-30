'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface CircleIconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    isActive?: boolean;
    activeColorClass?: string;
    defaultColorClass?: string;
    hoverColorClass?: string;
    as?: any; // Allow rendering as motion.div or other components
}

export function CircleIconButton({
    children,
    className = '',
    isActive = false,
    activeColorClass = 'text-green-500',
    defaultColorClass = 'text-text-secondary',
    hoverColorClass = 'hover:text-coral',
    as: Component = motion.button,
    ...props
}: CircleIconButtonProps) {
    return (
        <Component
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
                w-10 h-10 rounded-full bg-white shadow-sm 
                flex items-center justify-center 
                transition-colors active:bg-green-50 
                ${isActive ? activeColorClass : `${defaultColorClass} ${hoverColorClass}`}
                ${className}
            `}
            {...props}
        >
            {children}
        </Component>
    );
}
