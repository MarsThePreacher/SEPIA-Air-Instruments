import { useEffect } from 'react';

/** Adds `is-visible` to every `.reveal` element once it scrolls into view. */
export function useReveal(deps: unknown[] = []) {
    useEffect(() => {
        const elements = document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)');
        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
