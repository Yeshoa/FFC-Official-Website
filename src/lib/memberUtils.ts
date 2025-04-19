import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';

const memberImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/members/*.{jpeg,jpg,png,svg,gif}', {
  eager: true,
  import: 'default',
});

export function getMemberImage(
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): ImageMetadata | null {
  if (!memberName) return null;
  const member = members.find(m => m.data.name === memberName);
  const imagePath = member?.data.flagPath;
  if (!imagePath || !memberImages[imagePath]) {
    console.warn(`Imagen no encontrada para el miembro: ${memberName} en la ruta: ${imagePath}`);
    return null;
  }
  return memberImages[imagePath];
}
export function getMemberLogo(
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): ImageMetadata | null {
  if (!memberName) return null;

  const member = members.find(m => m.data.name === memberName);
  const imagePath = member?.data.logoPath;
  
  if (!imagePath || !memberImages[imagePath]) {
    console.warn(`Logo no encontrada para el miembro: ${memberName} en la ruta: ${imagePath}`);
    return null;
  }
  return memberImages[imagePath];
}


