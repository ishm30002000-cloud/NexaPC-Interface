import { useCallback, useEffect, useRef, useState } from 'react';

/** Minimal async loader with retry; used to read from service modules. */
export function useAsync<T>(fn: () => Promise<T>, key: string) {
  const [state, setState] = useState<{ status: 'loading' | 'success' | 'error'; data?: T; error?: unknown }>({ status: 'loading' });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ status: 'loading', data: s.data }));
    fnRef.current().then(
      (data) => alive && setState({ status: 'success', data }),
      (error) => alive && setState({ status: 'error', error }),
    );
    return () => { alive = false; };
  }, [key, nonce]);
  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry };
}

export function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
