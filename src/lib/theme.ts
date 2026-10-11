import { useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'sepia-theme';

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];
const listeners = new Set<() => void>();
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

let preference: ThemePreference = readPreference();

function readPreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
    }
    catch {
        // Ignore unavailable localStorage.
    }
    return 'system';
}

function applyTheme() {
    const resolved = preference === 'system' ? (darkQuery.matches ? 'dark' : 'light') : preference;
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#000000' : '#ffffff');
}

darkQuery.addEventListener('change', () => {
    if (preference === 'system')
        applyTheme();
});
applyTheme();

export function setTheme(next: ThemePreference) {
    preference = next;
    try {
        if (next === 'system') {
            localStorage.removeItem(THEME_STORAGE_KEY);
        }
        else {
            localStorage.setItem(THEME_STORAGE_KEY, next);
        }
    }
    catch {
        // Ignore unavailable localStorage.
    }
    applyTheme();
    listeners.forEach(listener => listener());
}

export function cycleTheme() {
    setTheme(ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useThemePreference(): ThemePreference {
    return useSyncExternalStore(subscribe, () => preference);
}
