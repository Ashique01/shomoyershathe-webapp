declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_BASE?: string
  }
}

declare var process: {
  env: NodeJS.ProcessEnv
}
