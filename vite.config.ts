import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['typescript'],
  },
  build: {
    outDir: './app/renderer',
    rollupOptions: {
      external: ['jsdom']
    }
  }
})
