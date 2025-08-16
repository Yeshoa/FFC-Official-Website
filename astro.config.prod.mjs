// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Production configuration with Netlify adapter
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  adapter: netlify(),
  integrations: [react(), mdx()]
});
