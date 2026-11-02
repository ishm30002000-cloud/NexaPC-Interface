import { Compass } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { EmptyState } from '@/components/nx/feedback';
import { ButtonLink } from '@/components/nx/Button';

export default function NotFound() {
  usePageMeta('Page not found', 'This page does not exist on NexaPC.');
  return (
    <div className="container-nexa py-16">
      <EmptyState
        headingLevel={1}
        icon={<Compass aria-hidden className="h-8 w-8" />}
        title="Page not found"
        body="The page you are looking for does not exist or has moved."
        action={<div className="flex flex-wrap justify-center gap-3"><ButtonLink to="/">Home</ButtonLink><ButtonLink to="/products" variant="secondary">Browse products</ButtonLink></div>}
      />
    </div>
  );
}
