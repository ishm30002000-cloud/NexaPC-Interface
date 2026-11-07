import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/data/products';
import { getProducts } from '@/services/products';

const CatalogContext = createContext<{ products: Product[]; loading: boolean; error: unknown; refresh: () => void } | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: ['catalog'], queryFn: getProducts, refetchInterval: 60_000, staleTime: 15_000 });
  return <CatalogContext.Provider value={{ products: query.data ?? [], loading: query.isPending, error: query.error, refresh: () => { void query.refetch(); } }}>{children}</CatalogContext.Provider>;
}
export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('CatalogProvider is missing');
  return value;
}
