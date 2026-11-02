import { useEffect } from 'react';

/** Sets the page title and meta description for each route. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title ? `${title} | NexaPC` : 'NexaPC';
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', description);
  }, [title, description]);
}

export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
