import { Check, X } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/schemas';
import { cn } from '@/lib/utils';

export function PasswordChecklist({ value, id }: { value: string; id: string }) {
  return (
    <ul id={id} className="grid gap-1 sm:grid-cols-2" aria-label="Password requirements">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(value);
        return (
          <li key={r.id} className={cn('flex items-center gap-2 text-sm', ok ? 'text-success' : 'text-muted')}>
            {ok ? <Check aria-hidden className="h-4 w-4" /> : <X aria-hidden className="h-4 w-4" />}
            {r.label}
            <span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
