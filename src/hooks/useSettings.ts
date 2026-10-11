import { useState, useCallback, useEffect } from 'react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
const STORAGE_KEY = 'air-instruments-settings';
interface UseSettingsReturn {
    settings: Settings;
    updateSettings: (updates: Partial<Settings>) => void;
    resetSettings: () => void;
}
export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        }
        catch {
            // Ignore unavailable or invalid localStorage data.
        }
        return DEFAULT_SETTINGS;
    });
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
        catch {
            // Ignore localStorage write failures.
        }
    }, [settings]);
    const updateSettings = useCallback((updates: Partial<Settings>) => {
        setSettings(current => ({ ...current, ...updates }));
    }, []);
    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        try {
            localStorage.removeItem(STORAGE_KEY);
        }
        catch {
            // Ignore localStorage removal failures.
        }
    }, []);
    return {
        settings,
        updateSettings,
        resetSettings,
    };
}
