import type { Product } from '@/data/products';

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface ResolvedLine {
  product: Product;
  quantity: number;
  /** Line subtotal in fils, or null when the unit price is unknown. */
  subtotalFils: number | null;
}

export interface CartTotals {
  lines: ResolvedLine[];
  itemCount: number;
  /** Sum of known-price lines, in integer fils. */
  knownSubtotalFils: number;
  /** True when at least one line has no price — totals must say "Pricing pending". */
  hasPendingPrices: boolean;
  /** At least one priced line uses an explicitly marked testing price. */
  hasSamplePrices?: boolean;
  /** Full subtotal, only when every line has a price. */
  subtotalFils: number | null;
  /** Shipping and discounts are not configured; null = "Calculated at checkout". */
  shippingFils: number | null;
  discountFils: number | null;
  totalFils: number | null;
  /** Lines whose product no longer exists in the catalog. */
  missingIds: string[];
}

/** Preview cap used when real stock is unknown. Not a stock claim. */
export const PREVIEW_QTY_CAP = 10;

export function maxQuantityFor(p: Pick<Product, 'stock'>): number {
  return p.stock == null ? PREVIEW_QTY_CAP : Math.max(0, p.stock);
}

export function lineSubtotal(priceFils: number | null, qty: number): number | null {
  if (priceFils == null) return null;
  if (!Number.isInteger(priceFils) || !Number.isInteger(qty)) {
    throw new Error('Money math requires integer fils and integer quantities');
  }
  return priceFils * qty;
}

export function computeTotals(cart: CartLine[], catalog: Product[]): CartTotals {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const lines: ResolvedLine[] = [];
  const missingIds: string[] = [];
  let known = 0;
  let pending = false;
  let count = 0;
  for (const l of cart) {
    const product = byId.get(l.productId);
    if (!product) {
      missingIds.push(l.productId);
      continue;
    }
    const sub = lineSubtotal(product.priceFils, l.quantity);
    if (sub == null) pending = true;
    else known += sub;
    count += l.quantity;
    lines.push({ product, quantity: l.quantity, subtotalFils: sub });
  }
  const subtotal = pending ? null : known;
  return {
    lines,
    itemCount: count,
    knownSubtotalFils: known,
    hasPendingPrices: pending,
    hasSamplePrices: lines.some(line => line.product.isSamplePrice && line.product.priceFils != null),
    subtotalFils: subtotal,
    shippingFils: null,
    discountFils: null,
    totalFils: subtotal,
    missingIds,
  };
}
