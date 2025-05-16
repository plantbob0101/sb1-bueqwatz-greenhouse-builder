import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Set the base path for the application
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist', // Ensure this matches your build output directory
    sourcemap: true, // Helps with debugging
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
