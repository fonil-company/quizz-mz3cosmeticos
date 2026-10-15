import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Mesmo repasse do Caddyfile, para `npm run dev` / `npm run preview` enviarem ao CRM Fonil. */
export default defineConfig(({ mode }) => {
  const token = loadEnv(mode, process.cwd(), '').FONIL_CRM_TOKEN || 'cmpsco6tj00036wt3kna7cp5b';
  const proxy = {
    '/api/crm-lead': {
      target: 'https://crm.fonilgroup.com.br',
      changeOrigin: true,
      rewrite: () => `/api/webhooks/leads/${token}`,
    },
  };
  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  };
});
