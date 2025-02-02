import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // مهم لـ Vercel
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
