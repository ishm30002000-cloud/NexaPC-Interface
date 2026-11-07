/**
 * One-time/idempotent website image migration. Run in the server environment:
 * pnpm --filter @workspace/scripts run migrate:nexapc-images
 *
 * Never import this script into a browser bundle. It never prints credentials.
 * Existing objects are verified, never overwritten.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const publicDir = path.join(root, 'artifacts/nexapc/public');
const origin = process.env.VITE_SUPABASE_URL;
const serverKey = process.env.SUPABASE_STORAGE_SERVICE_ROLE_KEY;
const bucket = 'nexapc-images';
const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
};
if (!origin || !serverKey) throw new Error('Set VITE_SUPABASE_URL and SUPABASE_STORAGE_SERVICE_ROLE_KEY before running this server-only migration.');
if (serverKey !== serverKey.trim() || serverKey.startsWith('"') || serverKey.startsWith("'")) {
  throw new Error('The server key contains extra whitespace or quotes. Enter only the complete API key in Secrets.');
}
if (!serverKey.startsWith('sb_secret_') && !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(serverKey)) {
  throw new Error('This is not a Supabase project server API key. Use the complete project service_role key, not a personal access token, JWT signing secret, label or masked value.');
}
if (!serverKey.startsWith('sb_secret_')) {
  const claims = JSON.parse(Buffer.from(serverKey.split('.')[1], 'base64url').toString('utf8')) as { role?: string };
  if (claims.role !== 'service_role') throw new Error('The saved key is not the service_role key. The public anon key can read the catalog but cannot create a Storage bucket. Copy the separate service_role row from Legacy API Keys.');
}
if (process.argv.includes('--validate-config')) {
  process.stdout.write('Server key format is valid. The credential value has not been displayed.\n');
  process.exit(0);
}
const base = origin.replace(/\/$/, '');
// Match supabase-js: Storage requires Authorization as well as apikey, even
// when the gateway is resolving a modern sb_secret server key.
const headers: Record<string, string> = { apikey: serverKey, Authorization: `Bearer ${serverKey}` };
const sha256 = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
const encodePath = (name: string) => name.split('/').map(encodeURIComponent).join('/');

async function collect(dir: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const groups = await Promise.all(entries.map(async entry => {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return collect(path.join(dir, entry.name), name);
    return entry.isFile() && mimeTypes[path.extname(entry.name).toLowerCase()] ? [name] : [];
  }));
  return groups.flat().sort();
}
async function readError(response: Response): Promise<{ message?: string; error?: string; statusCode?: string }> {
  try {
    const value = await response.json() as Record<string, unknown>;
    return {
      message: typeof value.message === 'string' ? value.message : undefined,
      error: typeof value.error === 'string' ? value.error : undefined,
      statusCode: value.statusCode == null ? undefined : String(value.statusCode),
    };
  } catch { return {}; }
}
async function migrate() {
  const files = await collect(publicDir);
  if (!files.length) throw new Error('No local website images were found.');
  const existingBucket = await fetch(`${base}/storage/v1/bucket/${bucket}`, { headers });
  if (!existingBucket.ok) {
    const error = await readError(existingBucket);
    const missing = existingBucket.status === 404 || error.statusCode === '404' || /bucket not found/i.test(error.message ?? error.error ?? '');
    if (!missing) {
      throw new Error(`Bucket lookup failed (${existingBucket.status}): ${error.message ?? error.error ?? 'No error detail'}. Verify the server-side Supabase key belongs to this project.`);
    }
    const created = await fetch(`${base}/storage/v1/bucket`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bucket, name: bucket, public: true, file_size_limit: 5 * 1024 * 1024,
        allowed_mime_types: Object.values(mimeTypes),
      }),
    });
    if (!created.ok) {
      const error = await readError(created);
      throw new Error(`Bucket creation failed (${created.status}): ${error.message ?? error.error ?? 'No error detail'}.`);
    }
  } else {
    const config = await existingBucket.json() as { public: boolean };
    if (!config.public) throw new Error('The existing bucket is private. Refusing to change access on an existing bucket.');
  }
  const manifest: { path: string; bytes: number; sha256: string; contentType: string; publicUrl: string }[] = [];
  for (const name of files) {
    const bytes = await readFile(path.join(publicDir, name));
    if (bytes.length > 5 * 1024 * 1024) throw new Error(`Image exceeds the 5 MiB bucket limit: ${name}`);
    const hash = sha256(bytes);
    const contentType = mimeTypes[path.extname(name).toLowerCase()];
    const publicUrl = `${base}/storage/v1/object/public/${bucket}/${encodePath(name)}`;
    const existing = await fetch(publicUrl);
    if (existing.ok) {
      if (sha256(new Uint8Array(await existing.arrayBuffer())) !== hash) {
        throw new Error(`An object with different content already exists: ${name}. It has not been overwritten.`);
      }
    } else {
      const failure = await readError(existing);
      if (existing.status !== 404 && failure.statusCode !== '404' && !/object not found/i.test(failure.message ?? failure.error ?? '')) {
        throw new Error(`Cannot check public image ${name} (${existing.status}).`);
      }
      const uploaded = await fetch(`${base}/storage/v1/object/${bucket}/${encodePath(name)}`, {
        method: 'POST', headers: {
          ...headers, 'Content-Type': contentType, 'Cache-Control': 'max-age=3600', 'x-upsert': 'false',
        },
        body: bytes,
      });
      if (!uploaded.ok) throw new Error(`Upload failed for ${name} (${uploaded.status}). Existing objects have not been overwritten.`);
    }
    const verified = await fetch(publicUrl, { cache: 'no-store' });
    if (!verified.ok || sha256(new Uint8Array(await verified.arrayBuffer())) !== hash) {
      throw new Error(`Public download verification failed for ${name}. Do not update image references yet.`);
    }
    manifest.push({ path: name, bytes: bytes.length, sha256: hash, contentType, publicUrl });
    process.stdout.write(`Verified ${name} (${bytes.length} bytes)\n`);
  }
  const manifestDir = path.join(root, '.local/migrations');
  await mkdir(manifestDir, { recursive: true });
  await writeFile(path.join(manifestDir, 'nexapc-images-manifest.json'), JSON.stringify({ bucket, files: manifest }, null, 2) + '\n');
  process.stdout.write(`Completed: ${manifest.length} public images in ${bucket}. No browser write permissions were granted.\n`);
}
await migrate().catch(error => {
  // Never dump request headers, SDK objects, environment values or credentials.
  const message = error instanceof Error ? error.message : 'Image migration failed.';
  process.stderr.write(message.replaceAll(serverKey, '[redacted]') + '\n');
  process.exitCode = 1;
});
