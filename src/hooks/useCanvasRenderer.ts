import { useEffect, useRef } from 'react';
import type { Hand, Particle, InstrumentPreset } from '../types';
import { clearCanvas, drawMirroredVideo, drawCameraOverlay, drawHandSkeleton, drawFingertips, drawParticles, } from '../utils/canvas';
interface UseCanvasRendererOptions {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    hands: Hand[];
    particles: Particle[];
    instrument: InstrumentPreset;
    showSkeleton: boolean;
    showParticles: boolean;
    showLabels: boolean;
    isActive: boolean;
}
interface UseCanvasRendererReturn {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}
export function useCanvasRenderer({ videoRef, hands, particles, instrument, showSkeleton, showParticles, showLabels, isActive, }: UseCanvasRendererOptions): UseCanvasRendererReturn {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    useEffect(() => {
        if (!isActive)
            return;
        const render = () => {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (!canvas || !video)
                return;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            clearCanvas(ctx, canvas.width, canvas.height);
            drawMirroredVideo(ctx, video, canvas.width, canvas.height);
            drawCameraOverlay(ctx, canvas.width, canvas.height, 0.35);
            if (showSkeleton) {
                hands.forEach(hand => {
                    drawHandSkeleton(ctx, hand, canvas.width, canvas.height);
                });
            }
            hands.forEach(hand => {
                drawFingertips(ctx, hand, instrument, canvas.width, canvas.height, showLabels);
            });
            if (showParticles) {
                drawParticles(ctx, particles);
            }
            animationRef.current = requestAnimationFrame(render);
        };
        animationRef.current = requestAnimationFrame(render);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [videoRef, hands, particles, instrument, showSkeleton, showParticles, showLabels, isActive]);
    return {
        canvasRef,
    };
}
