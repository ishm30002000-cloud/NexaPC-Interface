/**
 * Product contracts and category navigation only.
 * All catalog records, specifications, descriptions, prices, stock and image
 * metadata live in Supabase. Runtime reads go through services/products.ts.
 */
export type CategorySlug =
  | 'ssd-storage'
  | 'pc-cooling'
  | 'graphics-cards'
  | 'gaming-monitors'
  | 'processors'
  | 'memory'
  | 'accessories';

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Original photo attribution; see SOURCES.md. */
  source: string;
}
export interface ProductSpec { label: string; value: string | null }
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  /** Integer fils. null means not provided, never zero. */
  priceFils: number | null;
  /** Explicitly authorized testing prices, not confirmed selling prices. */
  isSamplePrice?: boolean;
  /** null means stock has not been provided. */
  stock: number | null;
  images: ProductImage[];
  shortDescription: string;
  description: string;
  specs: ProductSpec[];
  featured: boolean;
  featuredMonitor?: boolean;
  isPlaceholder?: boolean;
  reference?: string;
}
export const CATEGORIES: { slug: CategorySlug; name: string; blurb: string }[] = [
  { slug: 'ssd-storage', name: 'SSD Storage', blurb: 'NVMe and SATA drives for faster boots and loads.' },
  { slug: 'pc-cooling', name: 'PC Cooling Systems', blurb: 'Air coolers that keep clocks steady under load.' },
  { slug: 'graphics-cards', name: 'Graphics Cards', blurb: 'GPUs for high refresh gaming and creation.' },
  { slug: 'gaming-monitors', name: 'Gaming Monitors', blurb: 'High refresh panels from Samsung, SADES and MSI.' },
  { slug: 'processors', name: 'Processors', blurb: 'Desktop CPUs for gaming builds.' },
  { slug: 'memory', name: 'RAM', blurb: 'DDR5 memory kits.' },
  { slug: 'accessories', name: 'Gaming Accessories', blurb: 'Mice and peripherals.' },
];
