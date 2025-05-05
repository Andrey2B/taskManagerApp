/// <reference types="vite/client" />

interface ImportMetaEnv {
    REACT_APP_API_URL: any;
    readonly VITE_API_URL: string;
    readonly VITE_MODE: string;
    // можешь добавить сюда другие переменные
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }