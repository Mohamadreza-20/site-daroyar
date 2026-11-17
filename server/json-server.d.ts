declare module 'json-server' {
  import type { Express, RequestHandler, Router } from 'express'

  interface JsonServerRouter extends Router {
    db: import('./types.ts').Db
  }

  interface DefaultsOptions {
    static?: string
    logger?: boolean
    bodyParser?: boolean
  }

  const jsonServer: {
    create: () => Express
    router: (file: string) => JsonServerRouter
    defaults: (options?: DefaultsOptions) => RequestHandler[]
  }

  export default jsonServer
}
