import type { InstrumentPreset, NoteHistoryItem, FingerName } from '../../types';
import { FINGER_NAMES } from '../../constants';

interface RightPanelProps {
    instrument: InstrumentPreset;
    activeFingers: Set<string>;
    noteHistory: NoteHistoryItem[];
}

export function RightPanel({ instrument, activeFingers, noteHistory }: RightPanelProps) {
    const recent = noteHistory.slice(-8).reverse();
    return (<aside className="panel-right" aria-label="Finger mapping">
      <div className="panel-right__hands">
        <FingerMap title="Left hand" short="L" side="left" instrument={instrument} activeFingers={activeFingers}/>
        <FingerMap title="Right hand" short="R" side="right" instrument={instrument} activeFingers={activeFingers}/>
      </div>

      <section className="recent" aria-labelledby="recent-title">
        <h3 className="panel-right__title" id="recent-title">Recently played</h3>
        {recent.length > 0 ? (<ol className="recent__list">
            {recent.map((item) => (<li key={item.id} className="recent__item">
                <span className="recent__dot" style={{ background: item.color }}/>
                <span className="recent__note">{item.note}</span>
                <span className="recent__meta">{item.hand === 'left' ? 'Left' : 'Right'} {item.finger}</span>
              </li>))}
          </ol>) : (<p className="recent__empty">Raise a finger to play.</p>)}
      </section>
    </aside>);
}

interface FingerMapProps {
    title: string;
    short: string;
    side: 'left' | 'right';
    instrument: InstrumentPreset;
    activeFingers: Set<string>;
}

function FingerMap({ title, short, side, instrument, activeFingers }: FingerMapProps) {
    return (<section className="finger-map" aria-label={title}>
      <h3 className="panel-right__title">
        <span className="finger-map__title-long">{title}</span>
        <span className="finger-map__title-short" aria-hidden="true">{short}</span>
      </h3>
      <ul className="finger-map__list">
        {FINGER_NAMES.map((finger) => {
            const note = instrument[side][finger as FingerName];
            const isActive = activeFingers.has(`${side}_${finger}`);
            return (<li key={finger} className={`finger-map__item ${isActive ? 'is-active' : ''}`} style={{ '--note': note.color } as React.CSSProperties}>
              <span className="finger-map__finger">{finger}</span>
              <span className="finger-map__note">
                <span className="finger-map__dot"/>
                {note.name}
              </span>
            </li>);
        })}
      </ul>
    </section>);
}
