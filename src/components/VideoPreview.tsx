import { useEffect, useRef } from 'react';

interface VideoPreviewProps {
    stream: MediaStream | null;
    className?: string;
    muted?: boolean;
}

export function VideoPreview({ stream, className = '', muted = true }: VideoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
    }, [stream]);

    if (!stream) {
        return (
            <div className={`flex items-center justify-center bg-black/20 text-gray-400 rounded-xl border border-white/5 ${className}`}>
                <span className="text-sm">No video stream</span>
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className={`w-full h-full object-cover bg-black rounded-xl ${className}`}
        />
    );
}
