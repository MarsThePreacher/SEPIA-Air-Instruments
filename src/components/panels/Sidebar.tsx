import { useEffect, useMemo, useRef, useState } from 'react';
import type { InstrumentPreset } from '../../types';
import { INSTRUMENTS, INSTRUMENT_CATEGORIES } from '../../constants';
import { ThemeToggle } from '../site/ThemeToggle';
import { formatDuration, downloadRecording } from '../../utils/recording';
import { InstrumentIcon, SepiaLogo, HelpIcon, RecordIcon, StopRecordIcon, DownloadIcon, SearchIcon, CloseIcon, CheckIcon, ChevronLeftIcon } from '../ui/Icons';

export type SheetView = 'instruments' | 'settings' | null;

interface SidebarProps {
    selectedInstrumentId: string;
    onSelectInstrument: (id: string) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    showSkeleton: boolean;
    onShowSkeletonChange: (show: boolean) => void;
    showParticles: boolean;
    onShowParticlesChange: (show: boolean) => void;
    onHelpClick: () => void;
    onHomeClick: () => void;
    isRecording: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    recordingDuration: number;
    lastRecordingUrl: string | null;
    sheetView: SheetView;
    onCloseSheet: () => void;
}

export function Sidebar({ selectedInstrumentId, onSelectInstrument, volume, onVolumeChange, showSkeleton, onShowSkeletonChange, showParticles, onShowParticlesChange, onHelpClick, onHomeClick, isRecording, onStartRecording, onStopRecording, recordingDuration, lastRecordingUrl, sheetView, onCloseSheet, }: SidebarProps) {
    const [query, setQuery] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        return INSTRUMENT_CATEGORIES.map(category => ({
            ...category,
            instruments: INSTRUMENTS.filter(i => i.category === category.id && (!q ||
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                category.label.toLowerCase().includes(q))),
        })).filter(group => group.instruments.length > 0);
    }, [query]);

    useEffect(() => {
        if (sheetView !== 'instruments')
            return;
        const frame = requestAnimationFrame(() => {
            listRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'center' });
        });
        return () => cancelAnimationFrame(frame);
    }, [sheetView]);

    const handleSelect = (id: string) => {
        onSelectInstrument(id);
        if (sheetView)
            onCloseSheet();
    };

    const viewClass = sheetView ? `sidebar--open sidebar--view-${sheetView}` : '';

    return (<aside className={`sidebar ${viewClass}`} aria-label="Instruments and settings">
      <div className="sidebar__grabber" aria-hidden="true"/>

      <header className="sidebar__header">
        <button type="button" className="sidebar__brand" onClick={onHomeClick} title="Back to home">
          <ChevronLeftIcon size={16} strokeWidth={2.2} className="sidebar__back"/>
          <SepiaLogo size={20}/>
          <span>Sepia</span>
        </button>
        <div className="sidebar__header-actions">
          <ThemeToggle />
          <button type="button" className="icon-button" onClick={onHelpClick} aria-label="How to play" title="How to play">
            <HelpIcon size={19}/>
          </button>
        </div>
        <h2 className="sidebar__sheet-title">{sheetView === 'settings' ? 'Settings' : 'Instruments'}</h2>
        <button type="button" className="sidebar__sheet-close" onClick={onCloseSheet}>Done</button>
      </header>

      <div className="sidebar__scroll" ref={listRef}>
        <section className="sidebar__group sidebar__group--recording" aria-labelledby="recording-title">
          <h3 className="sidebar__group-title" id="recording-title">Recording</h3>
          <div className="list">
            <div className="list__row recorder">
              {isRecording ? (<button type="button" className="recorder__button recorder__button--stop" onClick={onStopRecording}>
                  <StopRecordIcon size={16}/>
                  <span>Stop</span>
                </button>) : (<button type="button" className="recorder__button" onClick={onStartRecording}>
                  <RecordIcon size={16}/>
                  <span>Record</span>
                </button>)}
              <span className={`recorder__time ${isRecording ? 'is-live' : ''}`}>
                {isRecording ? formatDuration(recordingDuration) : lastRecordingUrl ? 'Ready to save' : 'Sepia’s audio only'}
              </span>
              {lastRecordingUrl && !isRecording && (<button type="button" className="icon-button recorder__save" onClick={() => downloadRecording(lastRecordingUrl)} aria-label="Save recording" title="Save recording">
                  <DownloadIcon size={18}/>
                </button>)}
            </div>
          </div>
        </section>

        <section className="sidebar__group sidebar__group--settings" aria-labelledby="sound-title">
          <h3 className="sidebar__group-title" id="sound-title">Sound & Display</h3>
          <div className="list">
            <div className="list__row list__row--stacked">
              <div className="list__row-head">
                <label htmlFor="volume">Volume</label>
                <span className="list__value">{volume}%</span>
              </div>
              <input id="volume" className="slider" type="range" min="0" max="100" value={volume} style={{ '--fill-percent': `${volume}%` } as React.CSSProperties} onChange={(e) => onVolumeChange(Number(e.target.value))}/>
            </div>
            <label className="list__row">
              <span>Hand skeleton</span>
              <input className="switch" type="checkbox" role="switch" checked={showSkeleton} onChange={(e) => onShowSkeletonChange(e.target.checked)}/>
            </label>
            <label className="list__row">
              <span>Particles</span>
              <input className="switch" type="checkbox" role="switch" checked={showParticles} onChange={(e) => onShowParticlesChange(e.target.checked)}/>
            </label>
          </div>
        </section>

        <div className="sidebar__instruments">
          <div className="search">
            <SearchIcon size={16} className="search__icon"/>
            <input type="search" className="search__input" placeholder="Search instruments" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search instruments" enterKeyHint="search" autoComplete="off"/>
            {query && (<button type="button" className="search__clear" onClick={() => setQuery('')} aria-label="Clear search">
                <CloseIcon size={12} strokeWidth={2.5}/>
              </button>)}
          </div>

          {groups.map(group => (<section key={group.id} className="sidebar__group" aria-label={group.label}>
              <h3 className="sidebar__group-title">{group.label}</h3>
              <div className="list">
                {group.instruments.map(instrument => (<InstrumentRow key={instrument.id} instrument={instrument} isActive={instrument.id === selectedInstrumentId} onClick={() => handleSelect(instrument.id)}/>))}
              </div>
            </section>))}

          {groups.length === 0 && (<p className="sidebar__empty">No instruments match “{query}”.</p>)}
        </div>
      </div>
    </aside>);
}

interface InstrumentRowProps {
    instrument: InstrumentPreset;
    isActive: boolean;
    onClick: () => void;
}

function InstrumentRow({ instrument, isActive, onClick }: InstrumentRowProps) {
    return (<button type="button" className={`list__row instrument-row ${isActive ? 'is-active' : ''}`} onClick={onClick} aria-pressed={isActive}>
      <span className="instrument-row__icon">
        <InstrumentIcon icon={instrument.icon} size={18}/>
      </span>
      <span className="instrument-row__text">
        <span className="instrument-row__name">{instrument.name}</span>
        <span className="instrument-row__desc">{instrument.description}</span>
      </span>
      {isActive && <CheckIcon size={16} strokeWidth={2.4} className="instrument-row__check"/>}
    </button>);
}
