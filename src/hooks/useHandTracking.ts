import { useEffect, useRef, useState, useCallback } from 'react';
import type { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import type { Hand } from '../types';
import { VIDEO_CONFIG } from '../constants';
import { getPreloadedHandLandmarker } from '../utils/handLandmarkerPreloader';
interface UseHandTrackingOptions {
    enabled: boolean;
    onHandsDetected?: (hands: Hand[]) => void;
}
interface UseHandTrackingReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isLoading: boolean;
    error: string | null;
    hands: Hand[];
}
export function useHandTracking({ enabled, onHandsDetected, }: UseHandTrackingOptions): UseHandTrackingReturn {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastVideoTimeRef = useRef<number>(-1);
    const onHandsDetectedRef = useRef(onHandsDetected);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hands, setHands] = useState<Hand[]>([]);
    useEffect(() => {
        onHandsDetectedRef.current = onHandsDetected;
    }, [onHandsDetected]);
    useEffect(() => {
        if (enabled)
            return;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (videoRef.current?.srcObject) {
            const mediaStream = videoRef.current.srcObject as MediaStream;
            mediaStream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        if (handLandmarkerRef.current) {
            handLandmarkerRef.current.close();
            handLandmarkerRef.current = null;
        }
        setHands([]);
        setIsLoading(false);
        setError(null);
    }, [enabled]);
    const processResults = useCallback((results: HandLandmarkerResult) => {
        const detectedHands: Hand[] = [];
        if (results.landmarks && results.handednesses) {
            results.landmarks.forEach((landmarks, index) => {
                const handedness = results.handednesses[index]?.[0];
                if (handedness) {
                    detectedHands.push({
                        landmarks: landmarks.map((l) => ({
                            x: l.x,
                            y: l.y,
                            z: l.z,
                        })),
                        handedness: handedness.categoryName as 'Left' | 'Right',
                    });
                }
            });
        }
        setHands(detectedHands);
        onHandsDetectedRef.current?.(detectedHands);
    }, []);
    useEffect(() => {
        if (!enabled)
            return;
        let mounted = true;
        let stream: MediaStream | null = null;
        let detectionLoopId: number | null = null;
        const detectHands = () => {
            if (!handLandmarkerRef.current || !videoRef.current) {
                detectionLoopId = requestAnimationFrame(detectHands);
                return;
            }
            const video = videoRef.current;
            if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = video.currentTime;
                try {
                    const results = handLandmarkerRef.current.detectForVideo(video, performance.now());
                    processResults(results);
                }
                catch (err) {
                    console.error('Hand detection error:', err);
                }
            }
            detectionLoopId = requestAnimationFrame(detectHands);
        };
        const initialize = async () => {
            let handLandmarkerPromise: Promise<HandLandmarker> | null = null;
            try {
                setIsLoading(true);
                setError(null);
                lastVideoTimeRef.current = -1;
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Camera API is not available in this browser.');
                }
                const streamPromise = navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: VIDEO_CONFIG.width },
                        height: { ideal: VIDEO_CONFIG.height },
                        facingMode: VIDEO_CONFIG.facingMode,
                    },
                    audio: false,
                });
                handLandmarkerPromise = getPreloadedHandLandmarker();
                stream = await streamPromise;
                if (!mounted || !videoRef.current) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const video = videoRef.current;
                video.muted = true;
                video.playsInline = true;
                video.setAttribute('playsinline', 'true');
                video.srcObject = stream;
                await new Promise<void>((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        video.play().then(resolve).catch(reject);
                    };
                    video.onerror = () => reject(new Error('Video failed to load'));
                });
                const handLandmarker = await handLandmarkerPromise;
                if (!mounted)
                    return handLandmarker.close();
                handLandmarkerRef.current = handLandmarker;
                detectionLoopId = requestAnimationFrame(detectHands);
                animationFrameRef.current = detectionLoopId;
                setIsLoading(false);
            }
            catch (err: unknown) {
                if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                    stream = null;
                }
                if (videoRef.current?.srcObject) {
                    const mediaStream = videoRef.current.srcObject as MediaStream;
                    mediaStream.getTracks().forEach((track) => track.stop());
                    videoRef.current.srcObject = null;
                }
                if (handLandmarkerRef.current) {
                    handLandmarkerRef.current.close();
                    handLandmarkerRef.current = null;
                }
                if (handLandmarkerPromise) {
                    handLandmarkerPromise
                        .then((landmarker) => landmarker.close())
                        .catch(() => undefined);
                    handLandmarkerPromise = null;
                }
                if (mounted) {
                    const error = err instanceof Error ? err : new Error('Failed to initialize hand tracking');
                    console.error('Hand tracking initialization error:', error);
                    let errorMessage = error.message || 'Failed to initialize hand tracking';
                    if (error.name === 'NotAllowedError') {
                        errorMessage = 'Camera access denied. Please allow camera access and try again.';
                    }
                    else if (error.name === 'NotFoundError') {
                        errorMessage = 'No camera found. Please connect a camera and try again.';
                    }
                    else if (error.name === 'NotReadableError') {
                        errorMessage = 'Camera is in use by another application.';
                    }
                    else if (error.name === 'AbortError') {
                        errorMessage = 'Camera initialization was interrupted. Please try again.';
                    }
                    else if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('wasm')) {
                        errorMessage = 'Failed to load hand tracking assets. Check your internet connection and try again.';
                    }
                    setError(errorMessage);
                    setIsLoading(false);
                }
            }
        };
        initialize();
        const video = videoRef.current;
        return () => {
            mounted = false;
            if (detectionLoopId) {
                cancelAnimationFrame(detectionLoopId);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (video?.srcObject) {
                const mediaStream = video.srcObject as MediaStream;
                mediaStream.getTracks().forEach((track) => track.stop());
                video.srcObject = null;
            }
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close();
                handLandmarkerRef.current = null;
            }
        };
    }, [enabled, processResults]);
    return {
        videoRef,
        isLoading,
        error,
        hands,
    };
}
