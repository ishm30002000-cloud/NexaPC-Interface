/**
 * PREVIEW ONLY — sample order objects for the confirmation page layout.
 * No orders exist. A future backend must provide getOrder(reference).
 */
import { products } from '@/data/products';

export type OrderStatus = 'confirmed' | 'pending' | 'failed';

export interface PreviewOrder {
  reference: string;
  status: OrderStatus;
  items: { productId: string; quantity: number }[];
  delivery: { fullName: string; phone: string; address: string };
}

export function getPreviewOrder(reference: string, status: string | null): PreviewOrder | null {
  if (status !== 'confirmed' && status !== 'pending' && status !== 'failed') return null;
  const items = products.filter((p) => p.featuredMonitor).slice(0, 2).map((p) => ({ productId: p.id, quantity: 1 }));
  return {
    reference,
    status,
    items,
    delivery: { fullName: 'Sample recipient', phone: '5XXXXXXX', address: 'Sample block, street and building, Kuwait' },
  };
}
