import React, { useEffect, useRef } from 'react';

// ==========================================
// ASSET CONFIGURATION
// You can replace these URLs with your own Imgur or direct links
// ==========================================
const JUMPSCARE_IMAGE = "https://files.catbox.moe/8p9zxc.png"; 
const SCARE_SND = "https://files.catbox.moe/jtrnu5.mp3";
// ==========================================

export const Jumpscare = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(SCARE_SND);
        audio.volume = 1;
        // Attempt to play loudly immediately
        audio.play().catch(e => console.log('Audio auto-play blocked, interaction required', e));
        audioRef.current = audio;
        
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate([500, 100, 500, 100, 500, 100, 1000]);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
            <style>
                {`
                @keyframes violent-shake {
                    0% { transform: translate(0, 0) scale(1.1); }
                    10% { transform: translate(-50px, -30px) scale(1.3) rotate(-3deg); filter: contrast(1.5) brightness(1.2) saturate(1.5); }
                    20% { transform: translate(50px, 30px) scale(1.5) rotate(3deg); filter: contrast(2.0) brightness(1.5) saturate(2); }
                    30% { transform: translate(-30px, 50px) scale(1.2) rotate(-5deg); filter: contrast(1.5) brightness(0.8) invert(0.1); }
                    40% { transform: translate(30px, -50px) scale(1.6) rotate(4deg); filter: contrast(2.5) brightness(1.3) sepia(0.5); }
                    50% { transform: translate(-40px, -40px) scale(1.3) rotate(-2deg); filter: contrast(1.5) brightness(1.8) saturate(3); }
                    60% { transform: translate(40px, 40px) scale(1.4) rotate(5deg); filter: contrast(3.0) brightness(0.9) hue-rotate(90deg); }
                    70% { transform: translate(-60px, 10px) scale(1.5) rotate(-4deg); filter: contrast(1.5) brightness(1.4) saturate(2); }
                    80% { transform: translate(60px, -10px) scale(1.2) rotate(3deg); filter: contrast(2.2) brightness(1.1) invert(0.2); }
                    90% { transform: translate(10px, -60px) scale(1.7) rotate(-5deg); filter: contrast(1.8) brightness(1.6) saturate(1.5); }
                    100% { transform: translate(0, 0) scale(1.1); filter: contrast(1.5) brightness(1.2) saturate(1); }
                }
                .jumpscare-shake {
                    animation: violent-shake 0.15s infinite;
                    will-change: transform, filter;
                }
                `}
            </style>
            <img 
                src={JUMPSCARE_IMAGE} 
                alt="!" 
                className="w-full h-full object-cover jumpscare-shake mix-blend-normal"
            />
        </div>
    );
};
