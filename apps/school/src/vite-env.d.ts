/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSW_DELAY_MODE?: 'none' | 'fast' | 'realistic' | 'slow'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
