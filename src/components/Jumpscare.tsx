import React, { useEffect, useRef } from 'react';

// Please upload your image to the public folder and rename it to 'jumpscare.png'
const base = import.meta.env.BASE_URL;
const JUMPSCARE_IMAGE = `${base}jumpscare.png`; 
const SCARE_SND = `${base}screamer.mp3`;

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
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-75">
            <img 
                src={JUMPSCARE_IMAGE} 
                alt="!" 
                className="w-full h-full object-cover animate-pulse mix-blend-normal"
                style={{ filter: "contrast(1.5) brightness(1.2)" }}
            />
        </div>
    );
};
