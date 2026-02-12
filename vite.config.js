import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'build', // Changed from 'dist' to 'build' to match standard React project defaults on Vercel
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
  },
  server: {
    historyApiFallback: true, // For dev server routing
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  }
})
