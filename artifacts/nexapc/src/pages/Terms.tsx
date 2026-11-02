import { FileText } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/nx/feedback';
import { ButtonLink } from '@/components/nx/Button';

export default function Terms() {
  usePageMeta('Terms and Conditions', 'NexaPC terms and conditions.');
  return (
    <>
      <PageHeader crumbs={[{ label: 'Home', to: '/' }, { label: 'Terms and Conditions' }]} title="Terms and Conditions" />
      <div className="container-nexa py-12">
        <EmptyState icon={<FileText aria-hidden className="h-8 w-8" />} title="Terms are pending" body="The NexaPC terms and conditions have not been published yet. This page will be updated when they are available." action={<ButtonLink to="/">Home</ButtonLink>} />
      </div>
    </>
  );
}
