import { useEffect } from 'react';

const ORIGIN = 'https://sepia.website';

const TARGETS = [
    ['title', 'meta[property="og:title"]', 'content'],
    ['title', 'meta[name="twitter:title"]', 'content'],
    ['description', 'meta[name="description"]', 'content'],
    ['description', 'meta[property="og:description"]', 'content'],
    ['description', 'meta[name="twitter:description"]', 'content'],
    ['url', 'link[rel="canonical"]', 'href'],
    ['url', 'meta[property="og:url"]', 'content'],
] as const;

/** Overrides the document's title, description and canonical URL while a page is mounted. */
export function usePageMeta(meta: { title: string; description: string; path: string }) {
    const { title, description, path } = meta;
    useEffect(() => {
        const values = { title, description, url: ORIGIN + path };
        const previousTitle = document.title;
        const restore: [Element, string, string | null][] = [];
        document.title = title;
        TARGETS.forEach(([key, selector, attr]) => {
            const el = document.head.querySelector(selector);
            if (!el)
                return;
            restore.push([el, attr, el.getAttribute(attr)]);
            el.setAttribute(attr, values[key]);
        });
        return () => {
            document.title = previousTitle;
            restore.forEach(([el, attribute, value]) => value !== null && el.setAttribute(attribute, value));
        };
    }, [title, description, path]);
}
