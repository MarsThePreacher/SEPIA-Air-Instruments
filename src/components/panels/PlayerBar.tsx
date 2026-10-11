import type { InstrumentPreset } from '../../types';
import { ThemeToggle } from '../site/ThemeToggle';
import { InstrumentIcon, HelpIcon, SepiaLogo, SlidersIcon, DownloadIcon, ChevronLeftIcon } from '../ui/Icons';
import { downloadRecording, formatDuration } from '../../utils/recording';
import type { SheetView } from './Sidebar';

interface PlayerTopBarProps {
    onHomeClick: () => void;
    onHelpClick: () => void;
}

export function PlayerTopBar({ onHomeClick, onHelpClick }: PlayerTopBarProps) {
    return (<header className="player-topbar">
      <button type="button" className="player-topbar__brand" onClick={onHomeClick} aria-label="Back to home">
        <ChevronLeftIcon size={16} strokeWidth={2.2}/>
        <SepiaLogo size={18}/>
        <span>Sepia</span>
      </button>
      <div className="player-topbar__actions">
        <ThemeToggle />
        <button type="button" className="icon-button" onClick={onHelpClick} aria-label="How to play">
          <HelpIcon size={19}/>
        </button>
      </div>
    </header>);
}

interface PlayerToolbarProps {
    instrument: InstrumentPreset;
    onOpenSheet: (view: Exclude<SheetView, null>) => void;
    isRecording: boolean;
    recordingDuration: number;
    lastRecordingUrl: string | null;
    onStartRecording: () => void;
    onStopRecording: () => void;
}

export function PlayerToolbar({ instrument, onOpenSheet, isRecording, recordingDuration, lastRecordingUrl, onStartRecording, onStopRecording }: PlayerToolbarProps) {
    return (<nav className="player-toolbar" aria-label="Player controls">
      <button type="button" className="player-toolbar__instrument" onClick={() => onOpenSheet('instruments')}>
        <span className="player-toolbar__instrument-icon"><InstrumentIcon icon={instrument.icon} size={18}/></span>
        <span className="player-toolbar__instrument-text">
          <span className="player-toolbar__caption">Instrument</span>
          <span className="player-toolbar__name">{instrument.name}</span>
        </span>
      </button>

      <button type="button" className={`shutter ${isRecording ? 'is-recording' : ''}`} onClick={isRecording ? onStopRecording : onStartRecording} aria-label={isRecording ? `Stop recording, ${formatDuration(recordingDuration)}` : 'Start recording'}>
        <span className="shutter__inner"/>
      </button>

      <div className="player-toolbar__end">
        {lastRecordingUrl && !isRecording ? (<button type="button" className="player-toolbar__icon" onClick={() => downloadRecording(lastRecordingUrl)} aria-label="Save recording">
            <DownloadIcon size={20}/>
          </button>) : (<span className="player-toolbar__time" aria-hidden={!isRecording}>{isRecording ? formatDuration(recordingDuration) : ''}</span>)}
        <button type="button" className="player-toolbar__icon" onClick={() => onOpenSheet('settings')} aria-label="Settings">
          <SlidersIcon size={20}/>
        </button>
      </div>
    </nav>);
}
