import type { InstrumentPreset } from '../../types';
import { VIDEO_CONFIG } from '../../constants';
import { InstrumentIcon } from '../ui/Icons';

interface StageProps {
    instrument: InstrumentPreset;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    handsCount: number;
    leftAccuracy: number;
    rightAccuracy: number;
    isRecording: boolean;
    recordingTime: string;
}

export function Stage({ instrument, videoRef, canvasRef, handsCount, leftAccuracy, rightAccuracy, isRecording, recordingTime }: StageProps) {
    const detected = handsCount > 0;
    return (<main className="stage">
      <div className="stage__frame">
        <video ref={videoRef} className="stage__video" playsInline muted autoPlay/>
        <canvas ref={canvasRef} className="stage__canvas" width={VIDEO_CONFIG.width} height={VIDEO_CONFIG.height}/>

        <div className="stage__badge">
          <span className="stage__badge-icon"><InstrumentIcon icon={instrument.icon} size={18}/></span>
          <span className="stage__badge-text">
            <span className="stage__badge-name">{instrument.name}</span>
            <span className="stage__badge-desc">{instrument.description}</span>
          </span>
        </div>

        {isRecording && (<div className="stage__rec" role="status">
            <span className="stage__rec-dot" aria-hidden="true"/>
            <span>{recordingTime}</span>
          </div>)}

        <div className={`stage__hud ${detected ? 'is-detected' : ''}`} aria-live="polite">
          <Meter label="L" value={leftAccuracy}/>
          <span className="stage__hud-status">
            <span className="stage__hud-dot" aria-hidden="true"/>
            {detected ? `${handsCount} hand${handsCount > 1 ? 's' : ''}` : 'Show your hands'}
          </span>
          <Meter label="R" value={rightAccuracy}/>
        </div>
      </div>
    </main>);
}

function Meter({ label, value }: { label: string; value: number }) {
    const percent = Math.round(value * 100);
    return (<span className="meter" aria-label={`${label === 'L' ? 'Left' : 'Right'} hand tracking ${percent}%`}>
      <span className="meter__label">{label}</span>
      <span className="meter__track"><span className="meter__fill" style={{ transform: `scaleX(${value})` }}/></span>
      <span className="meter__value">{percent}</span>
    </span>);
}
