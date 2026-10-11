import { useEffect, useState } from 'react';
import { handleLinkClick } from '../../lib/router';
import { SepiaLogo } from '../ui/Icons';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
    { href: '/#how', label: 'How it works' },
    { href: '/#instruments', label: 'Instruments' },
    { href: '/privacy', label: 'Privacy' },
];

interface SiteNavProps {
    onPlay: () => void;
}

export function SiteNav({ onPlay }: SiteNavProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen)
            return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const onLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
        setMenuOpen(false);
        handleLinkClick(e);
    };

    return (<header className={`site-nav ${scrolled || menuOpen ? 'site-nav--scrolled' : ''} ${menuOpen ? 'site-nav--open' : ''}`}>
      <nav className="site-nav__bar" aria-label="Main">
        <a href="/" className="site-nav__brand" onClick={onLink}>
          <SepiaLogo size={20}/>
          <span>Sepia</span>
        </a>

        <ul className="site-nav__links">
          {LINKS.map(link => (<li key={link.href}>
              <a href={link.href} onClick={onLink}>{link.label}</a>
            </li>))}
        </ul>

        <div className="site-nav__actions">
          <ThemeToggle />
          <button type="button" className="button button--primary button--small site-nav__play" onClick={onPlay}>
            Play
          </button>
          <button type="button" className="icon-button site-nav__menu-button" aria-expanded={menuOpen} aria-controls="site-nav-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(open => !open)}>
            <span className="site-nav__menu-icon" aria-hidden="true"/>
          </button>
        </div>
      </nav>

      <div id="site-nav-menu" className="site-nav__menu" hidden={!menuOpen}>
        <ul>
          {LINKS.map((link, i) => (<li key={link.href} style={{ '--i': i } as React.CSSProperties}>
              <a href={link.href} onClick={onLink}>{link.label}</a>
            </li>))}
        </ul>
      </div>
    </header>);
}
