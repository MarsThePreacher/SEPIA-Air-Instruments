import { useState, useCallback, useRef, useEffect } from 'react';
import type { Hand, FingerName } from './types';
import { INSTRUMENTS, DEFAULT_INSTRUMENT_ID, FINGER_NAMES, } from './constants';
import { useAudioEngine, useAudioRecorder, useHandTracking, useParticles, useNoteHistory, useSettings, } from './hooks';
import { detectRaisedFingers, getPalmSize, getFingertipPosition, getRealHandSide, createFingerKey, drawMirroredVideo, drawCameraOverlay, drawHandSkeleton, drawFingertips, drawParticles, clearCanvas, startPreload, resetPreload, } from './utils';
import { Landing, Privacy, Sidebar, RightPanel, Stage, LoadingOverlay, ErrorOverlay, HelpModal, PlayerTopBar, PlayerToolbar, } from './components';
import type { SheetView } from './components';
import { formatDuration } from './utils/recording';
import { navigate, usePathname } from './lib/router';
import './styles/App.css';
export default function App() {
    const [isStarted, setIsStarted] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState(DEFAULT_INSTRUMENT_ID);
    const [activeFingers, setActiveFingers] = useState<Set<string>>(new Set());
    const [showHelp, setShowHelp] = useState(false);
    const [sheetView, setSheetView] = useState<SheetView>(null);
    const pathname = usePathname();
    const [leftAccuracy, setLeftAccuracy] = useState(0);
    const [rightAccuracy, setRightAccuracy] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prevStatesRef = useRef<Map<string, boolean>>(new Map());
    const animationRef = useRef<number | undefined>(undefined);
    const leftSamplesRef = useRef<number[]>([]);
    const rightSamplesRef = useRef<number[]>([]);
    const leftLastSeenRef = useRef<number>(0);
    const rightLastSeenRef = useRef<number>(0);
    const leftAccuracyRef = useRef<number>(0);
    const rightAccuracyRef = useRef<number>(0);
    const leftFacingRef = useRef<number>(0);
    const rightFacingRef = useRef<number>(0);
    const fingerRaisedFramesRef = useRef<Map<string, number>>(new Map());
    const DEBOUNCE_FRAMES = 3;
    const ACCURACY_WINDOW = 30;
    const ACCURACY_DECAY_MS = 1200;
    const computeAccuracy = useCallback((samples: number[], lastSeenMs: number, now: number, facingScore: number) => {
        if (samples.length < 3)
            return 0;
        if (now - lastSeenMs > ACCURACY_DECAY_MS)
            return 0;
        const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length;
        const variance = samples.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / samples.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / (mean || 1);
        const stability = Math.max(0, Math.min(1, 1 - cv / 0.08));
        const presence = Math.max(0, Math.min(1, 1 - (now - lastSeenMs) / ACCURACY_DECAY_MS));
        return Math.max(0, Math.min(1, stability * presence * facingScore));
    }, []);
    const getFacingScore = useCallback((hand: Hand) => {
        const landmarks = hand.landmarks;
        const mcpIds = [5, 9, 13, 17];
        const tipIds = [4, 8, 12, 16, 20];
        const avgMcpZ = mcpIds.reduce((sum, id) => sum + landmarks[id].z, 0) / mcpIds.length;
        const avgTipZ = tipIds.reduce((sum, id) => sum + landmarks[id].z, 0) / tipIds.length;
        const diff = avgMcpZ - avgTipZ;
        const score = Math.max(0, Math.min(1, diff / 0.03));
        return score;
    }, []);
    const instrument = INSTRUMENTS.find(i => i.id === selectedInstrumentId) || INSTRUMENTS[0];
    const { settings, updateSettings } = useSettings();
    const { particles, addParticle } = useParticles();
    const { history, addNote } = useNoteHistory();
    const { playNote, stopNote, stopAll } = useAudioEngine({
        instrument,
        volume: settings.volume,
    });
    const { isRecording, duration: recordingDuration, lastRecordingUrl, startRecording, stopRecording } = useAudioRecorder();
    useEffect(() => {
        if (pathname === '/')
            startPreload();
    }, [pathname]);
    useEffect(() => {
        if (!sheetView)
            return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetView(null);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [sheetView]);
    const handleHandsDetected = useCallback((detectedHands: Hand[]) => {
        if (!canvasRef.current)
            return;
        const newActiveFingers = new Set<string>();
        const now = performance.now();
        detectedHands.forEach((hand) => {
            const side = getRealHandSide(hand);
            const palmSize = getPalmSize(hand);
            const facingScore = getFacingScore(hand);
            if (side === 'left') {
                leftSamplesRef.current.push(palmSize);
                if (leftSamplesRef.current.length > ACCURACY_WINDOW) {
                    leftSamplesRef.current.shift();
                }
                leftLastSeenRef.current = now;
                leftFacingRef.current = facingScore;
            }
            else {
                rightSamplesRef.current.push(palmSize);
                if (rightSamplesRef.current.length > ACCURACY_WINDOW) {
                    rightSamplesRef.current.shift();
                }
                rightLastSeenRef.current = now;
                rightFacingRef.current = facingScore;
            }
        });
        detectedHands.forEach((hand) => {
            const handSide = getRealHandSide(hand);
            const raisedFingers = detectRaisedFingers(hand);
            const fingerConfig = instrument[handSide];
            FINGER_NAMES.forEach((fingerName, index) => {
                const key = createFingerKey(handSide, fingerName as FingerName);
                const isRaised = raisedFingers[index];
                const wasConfirmedRaised = prevStatesRef.current.get(key) || false;
                const noteConfig = fingerConfig[fingerName as FingerName];
                const currentFrames = fingerRaisedFramesRef.current.get(key) || 0;
                if (isRaised) {
                    fingerRaisedFramesRef.current.set(key, Math.min(currentFrames + 1, DEBOUNCE_FRAMES + 1));
                    const confirmedRaised = fingerRaisedFramesRef.current.get(key)! >= DEBOUNCE_FRAMES;
                    if (confirmedRaised) {
                        newActiveFingers.add(key);
                        if (!wasConfirmedRaised) {
                            playNote(key, noteConfig.notes);
                            const pos = getFingertipPosition(hand, index, canvasRef.current!.width, canvasRef.current!.height);
                            addParticle(pos, noteConfig.color, noteConfig.name);
                            addNote(noteConfig.name, handSide, fingerName as FingerName, noteConfig.color);
                        }
                        prevStatesRef.current.set(key, true);
                    }
                }
                else {
                    fingerRaisedFramesRef.current.set(key, 0);
                    if (wasConfirmedRaised) {
                        stopNote(key);
                        prevStatesRef.current.set(key, false);
                    }
                }
            });
        });
        prevStatesRef.current.forEach((wasRaised, key) => {
            if (wasRaised && !newActiveFingers.has(key)) {
                const [handSide] = key.split('_') as [
                    'left' | 'right',
                    FingerName
                ];
                const handStillVisible = detectedHands.some((h) => getRealHandSide(h) === handSide);
                if (!handStillVisible) {
                    stopNote(key);
                    prevStatesRef.current.set(key, false);
                    fingerRaisedFramesRef.current.set(key, 0);
                }
            }
        });
        setActiveFingers(newActiveFingers);
        const leftRaw = computeAccuracy(leftSamplesRef.current, leftLastSeenRef.current, now, leftFacingRef.current);
        const rightRaw = computeAccuracy(rightSamplesRef.current, rightLastSeenRef.current, now, rightFacingRef.current);
        leftAccuracyRef.current = leftAccuracyRef.current * 0.8 + leftRaw * 0.2;
        rightAccuracyRef.current = rightAccuracyRef.current * 0.8 + rightRaw * 0.2;
        setLeftAccuracy(leftAccuracyRef.current);
        setRightAccuracy(rightAccuracyRef.current);
    }, [instrument, playNote, stopNote, addParticle, addNote, computeAccuracy, getFacingScore]);
    const { videoRef, isLoading, error, hands } = useHandTracking({
        enabled: isStarted,
        onHandsDetected: handleHandsDetected,
    });
    useEffect(() => {
        if (!isStarted || isLoading)
            return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const render = () => {
            if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.parentElement?.style.setProperty('--video-ratio', String(video.videoWidth / video.videoHeight));
            }
            clearCanvas(ctx, canvas.width, canvas.height);
            drawMirroredVideo(ctx, video, canvas.width, canvas.height);
            drawCameraOverlay(ctx, canvas.width, canvas.height, 0.35);
            hands.forEach((hand) => {
                if (settings.showSkeleton) {
                    drawHandSkeleton(ctx, hand, canvas.width, canvas.height);
                }
                drawFingertips(ctx, hand, instrument, canvas.width, canvas.height, true);
            });
            if (settings.showParticles) {
                drawParticles(ctx, particles);
            }
            animationRef.current = requestAnimationFrame(render);
        };
        render();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isStarted, isLoading, hands, particles, instrument, settings.showSkeleton, settings.showParticles, videoRef]);
    useEffect(() => {
        return () => {
            stopAll();
        };
    }, [stopAll]);
    const handleStart = useCallback(() => {
        if (window.location.pathname !== '/')
            navigate('/');
        setIsStarted(true);
        window.scrollTo(0, 0);
    }, []);
    const handleInstrumentChange = useCallback((id: string) => {
        setSelectedInstrumentId(id);
        stopAll();
        prevStatesRef.current.clear();
        fingerRaisedFramesRef.current.clear();
        setActiveFingers(new Set());
    }, [stopAll]);
    const handleGoHome = useCallback(() => {
        stopAll();
        prevStatesRef.current.clear();
        fingerRaisedFramesRef.current.clear();
        setActiveFingers(new Set());
        setIsStarted(false);
        setLeftAccuracy(0);
        setRightAccuracy(0);
        setSheetView(null);
        resetPreload();
    }, [stopAll]);
    if (!isStarted) {
        return pathname === '/privacy' ? <Privacy onStart={handleStart}/> : <Landing onStart={handleStart}/>;
    }
    return (<div className={`app ${sheetView ? 'app--sheet-open' : ''}`}>
      {isLoading && <LoadingOverlay />}
      {error && <ErrorOverlay message={error} onHome={handleGoHome}/>}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)}/>

      <PlayerTopBar onHomeClick={handleGoHome} onHelpClick={() => setShowHelp(true)}/>

      <div className="app__main">
        <Sidebar selectedInstrumentId={selectedInstrumentId} onSelectInstrument={handleInstrumentChange} volume={settings.volume} onVolumeChange={(v) => updateSettings({ volume: v })} showSkeleton={settings.showSkeleton} onShowSkeletonChange={(v) => updateSettings({ showSkeleton: v })} showParticles={settings.showParticles} onShowParticlesChange={(v) => updateSettings({ showParticles: v })} onHelpClick={() => setShowHelp(true)} onHomeClick={handleGoHome} isRecording={isRecording} onStartRecording={startRecording} onStopRecording={stopRecording} recordingDuration={recordingDuration} lastRecordingUrl={lastRecordingUrl} sheetView={sheetView} onCloseSheet={() => setSheetView(null)}/>

        <Stage instrument={instrument} videoRef={videoRef} canvasRef={canvasRef} handsCount={hands.length} leftAccuracy={leftAccuracy} rightAccuracy={rightAccuracy} isRecording={isRecording} recordingTime={formatDuration(recordingDuration)}/>

        <RightPanel instrument={instrument} activeFingers={activeFingers} noteHistory={history}/>
      </div>

      <PlayerToolbar instrument={instrument} onOpenSheet={setSheetView} isRecording={isRecording} recordingDuration={recordingDuration} lastRecordingUrl={lastRecordingUrl} onStartRecording={startRecording} onStopRecording={stopRecording}/>

      <div className="sheet-scrim" onClick={() => setSheetView(null)} aria-hidden="true"/>
    </div>);
}
