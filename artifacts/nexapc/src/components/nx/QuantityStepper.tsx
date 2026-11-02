import { useId } from 'react';
import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({ value, max, onChange, label = 'Quantity', describedBy }: { value: number; max: number; onChange: (n: number) => void; label?: string; describedBy?: string }) {
  const id = useId();
  const btn = 'grid h-11 w-11 place-items-center rounded-[calc(var(--radius-control)-2px)] text-text transition-colors duration-150 hover:bg-surface-2 hover:text-cyan disabled:opacity-40';
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="inline-flex w-fit items-center rounded-[var(--radius-control)] border border-line-strong bg-ink/60 p-0.5">
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease ${label.toLowerCase()}`} data-testid="button-qty-dec">
          <Minus aria-hidden className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={value}
          aria-describedby={describedBy}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.max(1, Math.min(max, Math.floor(n))));
          }}
          className="tabular h-11 w-14 bg-transparent text-center text-base font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          data-testid="input-qty"
        />
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`} data-testid="button-qty-inc">
          <Plus aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
