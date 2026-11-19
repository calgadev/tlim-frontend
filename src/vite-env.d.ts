/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the tlim-java API, without a trailing slash (e.g. https://api.example.com).
   * Leave unset in development: requests go to /api on the Vite dev server, which proxies them.
   */
  readonly VITE_API_BASE_URL?: string;
  /** Dev only: where the Vite proxy forwards /api (default http://localhost:8080). */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
