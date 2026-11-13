import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
      proxy: {
        '/api': {
          target: 'http://192.168.31.187:5000',
          changeOrigin: true,
        },
      },
      host: '0.0.0.0',
  },
});
