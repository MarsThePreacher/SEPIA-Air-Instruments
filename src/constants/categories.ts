import type { InstrumentCategory } from '../types';

export const INSTRUMENT_CATEGORIES: { id: InstrumentCategory; label: string }[] = [
    { id: 'piano', label: 'Piano' },
    { id: 'chromatic', label: 'Chromatic Percussion' },
    { id: 'organ', label: 'Organ' },
    { id: 'guitar', label: 'Guitar' },
    { id: 'bass', label: 'Bass' },
    { id: 'strings', label: 'Strings' },
    { id: 'ensemble', label: 'Ensemble' },
    { id: 'brass', label: 'Brass' },
    { id: 'reed', label: 'Reed' },
    { id: 'pipe', label: 'Pipe' },
    { id: 'synth-lead', label: 'Synth Lead' },
    { id: 'synth-pad', label: 'Synth Pad' },
    { id: 'synth-fx', label: 'Synth FX' },
    { id: 'ethnic', label: 'World' },
    { id: 'percussive', label: 'Percussive' },
];
