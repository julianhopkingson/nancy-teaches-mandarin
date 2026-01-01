'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    src: string;
    title?: string;
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => {
            if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('canplaythrough', updateDuration);
        audio.addEventListener('ended', handleEnded);

        // 尝试立即获取时长（如果已经加载）
        updateDuration();

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('canplaythrough', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [src]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const time = parseFloat(e.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const vol = parseFloat(e.target.value);
        audio.volume = vol;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.volume = volume || 1;
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 sm:px-4 py-3 w-full">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-coral text-white hover:bg-coral-dark transition-colors flex-shrink-0"
            >
                {isPlaying ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            {/* Time Display - 单行显示 */}
            <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                {formatTime(currentTime)}/{formatTime(duration)}
            </span>

            {/* Progress Bar */}
            <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 min-w-0 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-coral"
                style={{
                    background: `linear-gradient(to right, var(--coral-orange) ${(currentTime / duration) * 100 || 0}%, #d1d5db ${(currentTime / duration) * 100 || 0}%)`
                }}
            />

            {/* Volume Control - 移动端只显示静音按钮 */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button onClick={toggleMute} className="text-text-muted hover:text-coral transition-colors">
                    {isMuted || volume === 0 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>
                {/* 音量滑块 - 移动端缩短 */}
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-12 sm:w-16 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-coral"
                    style={{
                        background: `linear-gradient(to right, var(--coral-orange) ${(isMuted ? 0 : volume) * 100}%, #d1d5db ${(isMuted ? 0 : volume) * 100}%)`
                    }}
                />
            </div>
        </div>
    );
}
