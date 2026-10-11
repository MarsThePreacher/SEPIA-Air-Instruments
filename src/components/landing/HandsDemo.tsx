import { useEffect, useState } from 'react';
import { HAND_CONNECTIONS, FINGER_NAMES, FINGER_TIP_IDS, INSTRUMENTS, DEFAULT_INSTRUMENT_ID } from '../../constants';
import type { FingerName } from '../../types';

/* An open right hand in MediaPipe's 21-landmark order, in a 200 × 240 box. */
const HAND: [number, number][] = [
    [100, 228],
    [72, 210], [50, 186], [34, 162], [21, 140],
    [72, 142], [66, 102], [62, 76], [59, 52],
    [99, 137], [99, 92], [99, 63], [99, 36],
    [124, 141], [130, 101], [133, 76], [136, 55],
    [146, 152], [157, 123], [163, 103], [168, 84],
];

type Key = `${'left' | 'right'}_${number}`;

/* A short progression, played as finger raises. */
const SEQUENCE: Key[][] = [
    ['left_0'], ['right_1'], ['left_2'], ['right_3'],
    ['left_3', 'right_0'], ['left_1'], ['right_4'], ['left_4', 'right_2'],
];

const STEP_MS = 950;

const instrument = INSTRUMENTS.find(i => i.id === DEFAULT_INSTRUMENT_ID) ?? INSTRUMENTS[0];

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HandsDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (prefersReducedMotion())
            return;
        const id = window.setInterval(() => {
            if (!document.hidden)
                setStep(s => (s + 1) % SEQUENCE.length);
        }, STEP_MS);
        return () => window.clearInterval(id);
    }, []);

    const active = new Set(SEQUENCE[step]);

    return (<div className="hands-demo" role="img" aria-label="Two hands tracked by Sepia, with fingertips lighting up as chords play">
      <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" className="hands-demo__svg">
        <defs>
          <radialGradient id="hands-demo-vignette" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#1d1d20"/>
            <stop offset="100%" stopColor="#0a0a0b"/>
          </radialGradient>
        </defs>
        <rect width="640" height="360" fill="url(#hands-demo-vignette)"/>
        <Hand side="left" transform="translate(296 64) scale(-1 1)" active={active}/>
        <Hand side="right" transform="translate(344 64)" active={active}/>
      </svg>

      <div className="hands-demo__hud">
        <span className="hands-demo__live" aria-hidden="true"/>
        <span>{instrument.name}</span>
      </div>
    </div>);
}

interface HandProps {
    side: 'left' | 'right';
    transform: string;
    active: Set<string>;
}

function Hand({ side, transform, active }: HandProps) {
    const mirrored = side === 'left';
    return (<g transform={transform}>
      {HAND_CONNECTIONS.map(([a, b]) => (<line key={`${a}-${b}`} x1={HAND[a][0]} y1={HAND[a][1]} x2={HAND[b][0]} y2={HAND[b][1]} className="hands-demo__bone"/>))}
      {HAND.map(([x, y], i) => (FINGER_TIP_IDS.includes(i as typeof FINGER_TIP_IDS[number]) ? null : <circle key={i} cx={x} cy={y} r={2.4} className="hands-demo__joint"/>))}
      {FINGER_NAMES.map((finger, index) => {
            const [x, y] = HAND[FINGER_TIP_IDS[index]];
            const note = instrument[side][finger as FingerName];
            const isOn = active.has(`${side}_${index}`);
            return (<g key={finger} className={`hands-demo__tip ${isOn ? 'is-on' : ''}`} style={{ '--note': note.color } as React.CSSProperties}>
              <circle cx={x} cy={y} r={22} className="hands-demo__glow"/>
              <circle cx={x} cy={y} r={isOn ? 9 : 4} className="hands-demo__dot"/>
              <text x={x} y={y - 22} transform={mirrored ? `translate(${2 * x} 0) scale(-1 1)` : undefined} className="hands-demo__label">
                {note.name}
              </text>
            </g>);
        })}
    </g>);
}
