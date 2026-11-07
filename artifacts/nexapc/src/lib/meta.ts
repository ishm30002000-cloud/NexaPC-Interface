import { useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { publicImageUrl } from '@/lib/image-assets';

/** Sets the page title and meta description for each route. */
export function usePageMeta(title: string, description: string) {
  const { t } = useLocale();
  useEffect(() => {
    document.title = title ? `${t(title)} | NexaPC` : 'NexaPC';
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', t(description));
  }, [title, description, t]);
}

export function assetUrl(path: string) {
  return publicImageUrl(import.meta.env.VITE_SUPABASE_URL, path);
}
