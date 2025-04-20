import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';

const memberImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/members/*.{jpeg,jpg,png}', {
  import: 'default',
});

export async function getMemberImageLazy(
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): Promise<ImageMetadata | null> {
  if (!memberName) return null;
  const member = members.find(m => m.data.name === memberName);
  const imagePath = member?.data.flagPath;
  
  if (!imagePath || !memberImages[imagePath]) {
    console.warn(`Imagen no encontrada para el miembro: ${memberName} en la ruta: ${imagePath}`);
    return null;
  }
  
  return await memberImages[imagePath]();
}

export async function getMemberLogoLazy(
  memberName: string | undefined,
  members: CollectionEntry<'members'>[]
): Promise<ImageMetadata | null> {
  if (!memberName) return null;

  const member = members.find(m => m.data.name === memberName);
  const imagePath = member?.data.logoPath;
  
  if (!imagePath || !memberImages[imagePath]) {
    console.warn(`Logo no encontrado para el miembro: ${memberName} en la ruta: ${imagePath}`);
    return null;
  }
  
  return await memberImages[imagePath]();
}