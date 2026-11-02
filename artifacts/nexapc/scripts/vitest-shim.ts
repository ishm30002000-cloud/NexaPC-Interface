/* Minimal vitest-compatible shim used only because the vitest package could not be
   installed in this environment (registry 403). Tests are written for vitest and run
   unchanged with `vitest` once it is installed. */
import { deepStrictEqual } from 'node:assert';
let failed = 0; let passed = 0; const prefix: string[] = [];
export function describe(name: string, fn: () => void) { prefix.push(name); fn(); prefix.pop(); }
export function it(name: string, fn: () => void) {
  const full = [...prefix, name].join(' > ');
  try { fn(); passed++; console.log(`  ok   ${full}`); }
  catch (e) { failed++; console.log(`  FAIL ${full}\n       ${(e as Error).message}`); }
}
export function expect(actual: unknown) {
  const fail = (m: string) => { throw new Error(m); };
  return {
    toBe: (v: unknown) => { if (!Object.is(actual, v)) fail(`expected ${JSON.stringify(actual)} to be ${JSON.stringify(v)}`); },
    toEqual: (v: unknown) => deepStrictEqual(actual, v),
    toBeNull: () => { if (actual !== null) fail(`expected ${JSON.stringify(actual)} to be null`); },
    toContain: (v: string) => { if (!String(actual).includes(v)) fail(`expected ${String(actual)} to contain ${v}`); },
    toHaveLength: (n: number) => { if ((actual as unknown[]).length !== n) fail(`expected length ${n}`); },
    toThrow: () => { try { (actual as () => void)(); } catch { return; } fail('expected to throw'); },
  };
}
process.on('exit', () => { console.log(`\n${passed} passed, ${failed} failed`); if (failed) process.exitCode = 1; });
