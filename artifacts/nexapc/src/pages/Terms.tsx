import { FileText } from 'lucide-react';
import { usePageMeta } from '@/lib/meta';
import { useLocale } from '@/lib/i18n';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/nx/feedback';
import { ButtonLink } from '@/components/nx/Button';

export default function Terms() {
  const { t } = useLocale();
  usePageMeta('Terms and Conditions', 'NexaPC terms and conditions.');
  return (
    <>
      <PageHeader crumbs={[{ label: t('Home'), to: '/' }, { label: t('Terms and Conditions') }]} title={t('Terms and Conditions')} />
      <div className="container-nexa py-12">
        <EmptyState icon={<FileText aria-hidden className="h-8 w-8" />} title={t('Terms are pending')} body={t('The NexaPC terms and conditions have not been published yet. This page will be updated when they are available.')} action={<ButtonLink to="/">{t('Home')}</ButtonLink>} />
      </div>
    </>
  );
}
