/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_PACKAGE_ID?: string;
  readonly VITE_POLICY_ID?: string;
  readonly VITE_ADDR_SELLER?: string;
  readonly VITE_ADDR_BUYER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
