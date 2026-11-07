import { useCallback } from 'react';
import type { Product } from '@/data/products';
import { useCart } from '@/store/cart';
import { useNxToast } from '@/components/nx/toast';
import { maxQuantityFor } from '@/lib/cart-totals';

export function useAddToCart() {
  const { add, ready } = useCart();
  const toast = useNxToast();
  return useCallback(
    (product: Product, qty: number) => {
      if (!ready) {
        toast({ tone: 'info', title: 'Your cart is still loading', body: 'Please wait for your saved cart to load, then try again.' });
        return;
      }
      const res = add(product.id, qty);
      const max = maxQuantityFor(product);
      if (res.added === 0) {
        toast({
          tone: 'info',
          title: 'Quantity limit reached',
          body: product.stock == null ? `Catalog preview allows up to ${max} of this item until real stock is provided.` : `Only ${max} in stock.`,
          link: { to: '/cart', label: 'View Cart' },
        });
        return;
      }
      toast({
        tone: 'success',
        title: 'Added to cart',
        body: `${res.added} x ${product.name}${product.priceFils == null ? '. Price pending.' : ''}`,
        link: { to: '/cart', label: 'View Cart' },
      });
    },
    [add, toast, ready],
  );
}
