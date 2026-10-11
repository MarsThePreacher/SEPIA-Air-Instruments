import type { Hand, Particle, InstrumentPreset, FingerName } from '../types';
import { HAND_CONNECTIONS, FINGER_NAMES, UI_CONFIG } from '../constants';
import { getFingertipPosition, getLandmarkPosition, detectRaisedFingers, getRealHandSide } from './handDetection';
import { getParticleOpacity } from './particles';
export function drawHandSkeleton(ctx: CanvasRenderingContext2D, hand: Hand, canvasWidth: number, canvasHeight: number): void {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    HAND_CONNECTIONS.forEach(([start, end]) => {
        const startPos = getLandmarkPosition(hand, start, canvasWidth, canvasHeight);
        const endPos = getLandmarkPosition(hand, end, canvasWidth, canvasHeight);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
    });
}
export function drawFingertips(ctx: CanvasRenderingContext2D, hand: Hand, instrument: InstrumentPreset, canvasWidth: number, canvasHeight: number, showLabels: boolean = true): void {
    const fingers = detectRaisedFingers(hand);
    const handSide = getRealHandSide(hand);
    const fingerConfig = instrument[handSide];
    FINGER_NAMES.forEach((fingerName, index) => {
        const pos = getFingertipPosition(hand, index, canvasWidth, canvasHeight);
        const noteConfig = fingerConfig[fingerName as FingerName];
        const isRaised = fingers[index];
        if (isRaised) {
            const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, UI_CONFIG.glowRadius);
            gradient.addColorStop(0, noteConfig.color);
            gradient.addColorStop(0.5, noteConfig.color + '88');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, UI_CONFIG.glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = noteConfig.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, UI_CONFIG.activeIndicatorRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            if (showLabels) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Inter Variable", "Segoe UI", system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(noteConfig.name, pos.x, pos.y - UI_CONFIG.glowRadius - 8);
            }
        }
        else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    particles.forEach((particle) => {
        const opacity = getParticleOpacity(particle);
        ctx.globalAlpha = opacity;
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color + '66');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        if (particle.life > particle.maxLife * 0.6) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Inter Variable", "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.note, particle.x, particle.y - particle.size - 10);
        }
    });
    ctx.globalAlpha = 1;
}
export function drawCameraOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number = 0.3): void {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.fillRect(0, 0, width, height);
}
export function drawMirroredVideo(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, width: number, height: number): void {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -width, 0, width, height);
    ctx.restore();
}
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.clearRect(0, 0, width, height);
}
