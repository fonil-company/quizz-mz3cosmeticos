/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER_PI?: string;
  readonly VITE_WHATSAPP_NUMBER_MA?: string;
  readonly VITE_CRM_ENDPOINT?: string;
  readonly VITE_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
