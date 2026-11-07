import { describe, expect, it } from 'vitest';
import { publicImageUrl } from './image-assets';

describe('Supabase image assets', () => {
  it('loads relative website images from the public Storage bucket', () => {
    expect(publicImageUrl('https://example.supabase.co/', '/hero-abstract.jpg'))
      .toBe('https://example.supabase.co/storage/v1/object/public/nexapc-images/hero-abstract.jpg');
  });
  it('keeps database image URLs intact rather than prefixing the app path', () => {
    const url = 'https://example.supabase.co/storage/v1/object/public/nexapc-images/products/photo.jpg';
    expect(publicImageUrl('https://example.supabase.co', url)).toBe(url);
  });
  it('encodes object names without removing folder separators', () => {
    expect(publicImageUrl('https://example.supabase.co', 'products/photo 1.jpg'))
      .toBe('https://example.supabase.co/storage/v1/object/public/nexapc-images/products/photo%201.jpg');
  });
});
