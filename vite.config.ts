import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Base path for GitHub Pages: repo name as subpath (e.g. /project/).
 * Set in CI via VITE_BASE; local dev uses '/' when unset.
 */
const base = process.env.VITE_BASE ? `/${process.env.VITE_BASE.replace(/^\/|\/$/g, '')}/` : '/';

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
