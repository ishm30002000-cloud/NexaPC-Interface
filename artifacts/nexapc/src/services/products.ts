/**
 * Product service — the only way UI reads catalog data.
 * Swap these implementations for real API calls later; signatures stay the same.
 */
import { CATEGORIES, products, type Product } from '@/data/products';

const latency = () => new Promise((r) => setTimeout(r, 220));

export async function getProducts(): Promise<Product[]> {
  await latency();
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await latency();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  await latency();
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const others = products.filter((p) => p.id !== product.id && p.category !== product.category && !p.isPlaceholder);
  return [...same, ...others].slice(0, limit);
}

/** Synchronous lookup used by the cart to re-read names/prices. */
export function getProductsSync(): Product[] {
  return products;
}

export function getCategories() {
  return CATEGORIES;
}

export function getBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));
}
