import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The optional API server (server/index.mjs) holds secrets; the browser only ever talks to /api.
    proxy: { '/api': 'http://localhost:8787' },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Curriculum content changes rarely: keep it in its own long-cached chunk, separate from app code.
        manualChunks(id) {
          if (id.replace(/\\/g, '/').includes('/src/data/')) return 'content';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react';
        },
      },
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
