import { CATEGORIES, type Product } from '@/data/products';
import { supabase } from '@/lib/supabase';

function product(row: { id: string; slug: string; details: unknown; price_fils: number | null; stock: number | null }): Product {
  return { ...(row.details as Omit<Product, 'id' | 'slug' | 'priceFils' | 'stock'>), id: row.id, slug: row.slug, priceFils: row.price_fils, stock: row.stock };
}
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at').order('id');
  if (error) throw error;
  return (data ?? []).map(product);
}
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? product(data) : null;
}
export async function getRelatedProducts(source: Product, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return [
    ...products.filter(p => p.id !== source.id && p.category === source.category),
    ...products.filter(p => p.id !== source.id && p.category !== source.category && !p.isPlaceholder),
  ].slice(0, limit);
}
export function getCategories() { return CATEGORIES; }
