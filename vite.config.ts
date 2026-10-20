import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Mesmos repasses do Caddyfile, para `npm run dev` / `npm run preview` (CRM Fonil e Meta CAPI). */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const crmToken = env.FONIL_CRM_TOKEN || 'cmuyevzib001hlf3j111omsuv';
  const pixelId = env.META_PIXEL_ID || env.VITE_META_PIXEL_ID || '4367782926817920';
  const capiToken = env.META_CAPI_TOKEN ?? '';
  const proxy = {
    '/api/crm-lead': {
      target: 'https://crm.fonilgroup.com.br',
      changeOrigin: true,
      rewrite: () => `/api/webhooks/leads/${crmToken}`,
    },
    '/api/meta-capi': {
      target: 'https://graph.facebook.com',
      changeOrigin: true,
      rewrite: () => `/v25.0/${pixelId}/events?access_token=${encodeURIComponent(capiToken)}`,
    },
  };
  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  };
});
