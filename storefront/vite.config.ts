import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ORDERS = process.env.ORDERS_URL ?? 'http://localhost:8080';
const SEARCH = process.env.SEARCH_URL ?? 'http://localhost:8000';
const IMAGE = process.env.IMAGE_URL ?? 'http://localhost:9000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: ORDERS, changeOrigin: true },
      '/search': { target: SEARCH, changeOrigin: true },
      '/img': { target: IMAGE, changeOrigin: true, rewrite: (p) => p.replace(/^\/img/, '') },
    },
  },
});
