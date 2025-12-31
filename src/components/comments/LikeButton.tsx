'use client';

import { motion } from 'framer-motion';

interface LikeButtonProps {
    isLiked: boolean;
    count: number;
    onClick: () => void;
    disabled?: boolean;
}

export function LikeButton({ isLiked, count, onClick, disabled }: LikeButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-coral' : 'text-text-muted hover:text-text-secondary'}`}
            whileTap={{ scale: 0.9 }}
        >
            <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
            <span>{count}</span>
        </motion.button>
    );
}
