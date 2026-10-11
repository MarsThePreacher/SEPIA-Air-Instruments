import { useEffect, useRef } from 'react';
import { CloseIcon, HandIcon, MusicNoteIcon, CameraIcon, RecordIcon } from './Icons';
import { INSTRUMENTS } from '../../constants';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOPICS = [
    { icon: HandIcon, title: 'Raise a finger to play', body: 'Hold a finger up to sustain its chord or note. Lower it to release. Both hands play at once, so you have ten voices.' },
    { icon: MusicNoteIcon, title: 'Change the instrument', body: `Choose from ${INSTRUMENTS.length} instruments. Each one has its own mapping, shown beside the camera view.` },
    { icon: RecordIcon, title: 'Record a take', body: 'Recording captures Sepia’s sound only. Save it as a file when you’re done.' },
    { icon: CameraIcon, title: 'Get the best tracking', body: 'Use even, front-facing light. Keep your palms toward the camera, about 30 to 60 cm away, with a plain background behind you.' },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen)
            return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        closeRef.current?.focus();
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen)
        return null;

    return (<div className="modal" onClick={onClose}>
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2 className="modal__title" id="help-title">How to play</h2>
          <button ref={closeRef} type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon size={14} strokeWidth={2.6}/>
          </button>
        </header>

        <ul className="modal__topics">
          {TOPICS.map(({ icon: Icon, title, body }) => (<li key={title}>
              <span className="modal__topic-icon"><Icon size={22}/></span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>))}
        </ul>

        <footer className="modal__footer">
          <button type="button" className="button button--primary modal__done" onClick={onClose}>Continue</button>
        </footer>
      </div>
    </div>);
}
