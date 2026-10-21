/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER_PI?: string;
  readonly VITE_WHATSAPP_NUMBER_MA?: string;
  readonly VITE_CRM_ENDPOINT?: string;
  readonly VITE_CRM_ENDPOINT_PI?: string;
  readonly VITE_CRM_ENDPOINT_MA?: string;
  readonly VITE_FONIL_CRM_PATH?: string;
  readonly VITE_FONIL_PIPELINE_STAGE?: string;
  readonly VITE_FONIL_CONSULTANT_PI?: string;
  readonly VITE_FONIL_CONSULTANT_MA?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_META_CAPI_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
