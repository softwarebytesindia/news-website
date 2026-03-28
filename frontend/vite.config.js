import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetHost = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: targetHost,
          changeOrigin: true,
        },
        '/uploads': {
          target: targetHost,
          changeOrigin: true,
        },
        // Proxy sitemap and RSS routes to backend
        '^/sitemap.*\\.xml$': {
          target: targetHost,
          changeOrigin: true,
        },
        '/rss.xml': {
          target: targetHost,
          changeOrigin: true,
        },
      },
    },
  };
});
