// Resolución de imágenes por string path ("/src/assets/images/...").
// En Astro, <Image>/getImage necesitan un módulo importado (ImageMetadata) para
// conocer las dimensiones; los paths en JSON son strings, así que se indexan acá.
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
  import: 'default',
}) as Record<string, ImageMetadata>;

const bySrcPath = new Map<string, ImageMetadata>();
for (const [key, mod] of Object.entries(modules)) {
  // key = "../assets/images/..." (relativo a src/utils) -> "/src/assets/images/..."
  bySrcPath.set(`/src/${key.replace(/^\.\.\//, '')}`, mod);
}

export function resolveImage(srcPath?: string): ImageMetadata | null {
  if (!srcPath) return null;
  return bySrcPath.get(srcPath) ?? null;
}
