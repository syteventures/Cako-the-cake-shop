// Vite: multi-page static site. npm run dev / npm run build (pages are generated first by tools/build-pages.mjs).
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const page = (f) => resolve(import.meta.dirname, f);
export default defineConfig({
  publicDir: 'public',
  server: { port: 5173, open: false },
  preview: { port: 4173 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: { input: { index: page('index.html'), cakes: page('cakes.html'), order: page('order.html'), visit: page('visit.html'), gallery: page('gallery.html') } },
  },
});
