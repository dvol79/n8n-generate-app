import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Для GitHub Pages установите имя репозитория в base
// Например: base: '/n8n-supabase-docker/'
// Для локальной разработки оставьте base: '/'
const base = process.env.GITHUB_PAGES ? '/n8n-generate-app/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
