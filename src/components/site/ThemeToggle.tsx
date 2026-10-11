import { cycleTheme, useThemePreference } from '../../lib/theme';
import { MoonIcon, SunIcon, SystemThemeIcon } from '../ui/Icons';

const LABELS = {
    system: 'Appearance: Automatic',
    light: 'Appearance: Light',
    dark: 'Appearance: Dark',
} as const;

export function ThemeToggle({ className = '' }: { className?: string }) {
    const preference = useThemePreference();
    const Icon = preference === 'light' ? SunIcon : preference === 'dark' ? MoonIcon : SystemThemeIcon;
    return (<button type="button" className={`icon-button theme-toggle ${className}`} onClick={cycleTheme} aria-label={`${LABELS[preference]}. Click to change.`} title={LABELS[preference]}>
      <Icon size={18} key={preference} className="theme-toggle__icon"/>
    </button>);
}
