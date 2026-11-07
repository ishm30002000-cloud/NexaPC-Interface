export const IMAGE_BUCKET = 'nexapc-images';

/** Product records may already contain complete public Storage URLs. */
export function publicImageUrl(projectUrl: string, imagePath: string): string {
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const objectPath = imagePath.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
  return `${projectUrl.replace(/\/+$/, '')}/storage/v1/object/public/${IMAGE_BUCKET}/${objectPath}`;
}
