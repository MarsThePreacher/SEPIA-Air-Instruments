import { useEffect, useState } from 'react';

const NAVIGATE_EVENT = 'sepia:navigate';

export function navigate(path: string) {
    const [pathname, hash] = path.split('#');
    if (pathname && pathname !== window.location.pathname) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event(NAVIGATE_EVENT));
        if (hash) {
            requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
        }
        else {
            window.scrollTo(0, 0);
        }
        return;
    }
    if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState({}, '', `#${hash}`);
    }
}

export function usePathname() {
    const [pathname, setPathname] = useState(() => window.location.pathname);
    useEffect(() => {
        const update = () => setPathname(window.location.pathname);
        window.addEventListener('popstate', update);
        window.addEventListener(NAVIGATE_EVENT, update);
        return () => {
            window.removeEventListener('popstate', update);
            window.removeEventListener(NAVIGATE_EVENT, update);
        };
    }, []);
    return pathname.replace(/\/+$/, '') || '/';
}

/** Intercepts same-origin link clicks so pages switch without a reload. */
export function handleLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const href = event.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('/') || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
        return;
    }
    event.preventDefault();
    navigate(href);
}
