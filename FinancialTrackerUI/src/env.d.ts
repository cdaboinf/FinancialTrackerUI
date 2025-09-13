interface ImportMetaEnv {
  readonly VITE_API_FinancialTransactions_URL: string
  readonly VITE_API_EmbeddingTransactionsApi_URL: string
  readonly VITE_API_VectorTransactionsApi_URL: string

  readonly VITE_AUTH0_DOMAIN: string
  readonly VITE_AUTH0_CLIENT_ID: string
  readonly VITE_AUTH0_CALLBACK_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
