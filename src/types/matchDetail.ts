import type { ImageMetadata } from 'astro';

// Vista normalizada de un equipo para la página de partido (selección o club).
// Se resuelve desde el id global de equipo (getTeamById) en la página.
export interface TeamView {
  name: string;
  code?: string;
  flag?: ImageMetadata | null;
  href?: string;
  type: 'national' | 'club';
  color?: string; // color primario del club (para iniciales/acentos)
}
