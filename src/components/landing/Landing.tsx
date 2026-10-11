import { useState } from 'react';
import { INSTRUMENTS, INSTRUMENT_CATEGORIES, FINGER_NAMES } from '../../constants';
import type { FingerName } from '../../types';
import { handleLinkClick } from '../../lib/router';
import { useReveal } from '../../lib/reveal';
import { SiteNav } from '../site/SiteNav';
import { SiteFooter } from '../site/SiteFooter';
import { ChevronRightIcon } from '../ui/Icons';
import { HandsDemo } from './HandsDemo';
import '../../styles/Site.css';
import '../../styles/Landing.css';

interface LandingProps {
    onStart: () => void;
}

const SHOWCASE = [
    { id: 'acoustic-grand-piano', label: 'Piano' },
    { id: 'acoustic-guitar-nylon', label: 'Guitar' },
    { id: 'alto-sax', label: 'Sax' },
    { id: 'pad-warm', label: 'Pad' },
];

const FAMILIES = INSTRUMENT_CATEGORIES.map(category => {
    const members = INSTRUMENTS.filter(i => i.category === category.id);
    return { ...category, count: members.length, examples: members.slice(0, 3).map(i => i.name) };
});

const STEPS = [
    { title: 'Allow the camera.', body: 'Sepia asks once. The hand-tracking model loads in a moment and runs on your device.' },
    { title: 'Raise a finger.', body: 'Each finger plays its own chord or note. Hold it to sustain. Lower it to let go.' },
    { title: 'Change the sound.', body: 'Switch between 120 instruments at any time. Every one has its own mapping.' },
];

export function Landing({ onStart }: LandingProps) {
    const [showcaseId, setShowcaseId] = useState(SHOWCASE[0]?.id);
    const showcase = INSTRUMENTS.find(i => i.id === showcaseId) ?? INSTRUMENTS[0];
    useReveal();

    return (<div className="site">
      <SiteNav onPlay={onStart}/>

      <main>
        <section className="hero" id="top">
          <p className="hero__eyebrow">Sepia Air Instruments</p>
          <h1 className="hero__title">Play music<br />with your hands.</h1>
          <p className="hero__lede">
            Raise a finger and hear a chord. 120 instruments, played through your camera, entirely in your browser.
          </p>
          <div className="hero__actions">
            <button type="button" className="button button--primary" onClick={onStart}>Start playing</button>
            <a className="text-link" href="/#how" onClick={handleLinkClick}>
              How it works <ChevronRightIcon size={16} strokeWidth={2}/>
            </a>
          </div>

          <div className="hero__screen">
            <HandsDemo />
          </div>
          <p className="hero__caption">Camera required. Video never leaves your device.</p>
        </section>

        <section className="section" id="how" aria-labelledby="how-title">
          <div className="section__inner">
            <h2 className="section__title reveal" id="how-title">Ten fingers.<br />Ten voices.</h2>
            <p className="section__lede reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
              Sepia follows 21 points on each hand and maps every finger to a note or chord.
              A finger has to stay raised for three frames before it sounds, so it plays what you mean, not what flickers.
            </p>

            <ol className="steps">
              {STEPS.map((step, i) => (<li key={step.title} className="steps__item reveal" style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
                  <span className="steps__index">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>))}
            </ol>

            <div className="mapping-card reveal">
              <div className="mapping-card__header">
                <div>
                  <h3 className="mapping-card__title">{showcase.name}</h3>
                  <p className="mapping-card__desc">{showcase.description}</p>
                </div>
                <div className="segmented" role="radiogroup" aria-label="Example instrument">
                  {SHOWCASE.map(item => (<button key={item.id} type="button" role="radio" aria-checked={item.id === showcase.id} className={`segmented__option ${item.id === showcase.id ? 'is-selected' : ''}`} onClick={() => setShowcaseId(item.id)}>
                      {item.label}
                    </button>))}
                </div>
              </div>

              <div className="mapping-card__hands">
                {(['left', 'right'] as const).map(side => (<div key={side} className="mapping-card__hand">
                    <h4>{side === 'left' ? 'Left hand' : 'Right hand'}</h4>
                    <ul>
                      {FINGER_NAMES.map(finger => {
                    const note = showcase[side][finger as FingerName];
                    return (<li key={finger}>
                            <span className="mapping-card__finger">{finger}</span>
                            <span className="mapping-card__note">
                              <span className="mapping-card__dot" style={{ background: note.color }}/>
                              {note.name}
                            </span>
                          </li>);
                })}
                    </ul>
                  </div>))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section--grouped" id="instruments" aria-labelledby="instruments-title">
          <div className="section__inner">
            <p className="stat reveal">
              <span className="stat__number">{INSTRUMENTS.length}</span>
              <span className="stat__label" id="instruments-title">instruments in {FAMILIES.length} families, from concert grand to shamisen.</span>
            </p>

            <ul className="families">
              {FAMILIES.map((family, i) => (<li key={family.id} className="families__item reveal" style={{ '--reveal-delay': `${(i % 3) * 70}ms` } as React.CSSProperties}>
                  <div className="families__head">
                    <h3>{family.label}</h3>
                    <span className="families__count">{family.count}</span>
                  </div>
                  <p>{family.examples.join(', ')}</p>
                </li>))}
            </ul>
          </div>
        </section>

        <section className="section" id="privacy" aria-labelledby="privacy-title">
          <div className="section__inner">
            <h2 className="section__title reveal" id="privacy-title">Your camera<br />stays with you.</h2>
            <p className="section__lede reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
              Hand tracking happens on your device. There is no account, no analytics and no cookie banner, because there is nothing to consent to.
            </p>

            <div className="facts">
              <div className="facts__item reveal">
                <h3>Processed on device</h3>
                <p>Camera frames go straight to a model running in your browser. They are never recorded, stored or sent anywhere.</p>
              </div>
              <div className="facts__item reveal" style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
                <h3>No microphone</h3>
                <p>Recordings capture only the sound Sepia makes. Your microphone is never requested.</p>
              </div>
              <div className="facts__item reveal" style={{ '--reveal-delay': '180ms' } as React.CSSProperties}>
                <h3>Stays local</h3>
                <p>Recordings live in memory until you save them. Settings stay in your browser’s storage.</p>
              </div>
            </div>

            <a className="text-link reveal" href="/privacy" onClick={handleLinkClick}>
              Read the Privacy Policy <ChevronRightIcon size={16} strokeWidth={2}/>
            </a>
          </div>
        </section>

        <section className="closer" aria-labelledby="closer-title">
          <h2 className="closer__title reveal" id="closer-title">Raise a hand.</h2>
          <div className="reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
            <button type="button" className="button button--primary" onClick={onStart}>Start playing</button>
          </div>
          <p className="closer__note reveal" style={{ '--reveal-delay': '140ms' } as React.CSSProperties}>
            Works in current versions of Safari, Chrome, Edge and Firefox. On a phone, landscape gives the widest view.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>);
}
