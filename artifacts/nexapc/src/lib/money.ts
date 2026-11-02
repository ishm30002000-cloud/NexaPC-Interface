const fmt = new Intl.NumberFormat('en-KW', {
  style: 'currency',
  currency: 'KWD',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/** The one money formatter. Input is integer fils (1 KWD = 1000 fils). */
export function formatMoney(fils: number): string {
  return fmt.format(Math.round(fils) / 1000);
}

export function formatPrice(fils: number | null): string {
  return fils == null ? 'Price pending' : formatMoney(fils);
}

/** Parse a typed KWD amount ("12.5") into integer fils, or null if invalid. */
export function kwdToFils(input: string): number | null {
  const t = input.trim();
  if (!t) return null;
  if (!/^\d+(\.\d{0,3})?$/.test(t)) return null;
  const [whole, frac = ''] = t.split('.');
  return Number(whole) * 1000 + Number(frac.padEnd(3, '0'));
}
