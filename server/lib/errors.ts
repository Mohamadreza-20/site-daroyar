import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express'

export interface HttpError extends Error {
  readonly status: number
  readonly extra: Record<string, unknown>
}

const HTTP_ERROR_NAME = 'HttpError'

export function createHttpError(status: number, message: string, extra: Record<string, unknown> = {}): HttpError {
  return Object.assign(new Error(message), { name: HTTP_ERROR_NAME, status, extra })
}

const isHttpError = (error: unknown): error is HttpError => error instanceof Error && error.name === HTTP_ERROR_NAME

export function fail(status: number, message: string, extra?: Record<string, unknown>): never {
  throw createHttpError(status, message, extra)
}

export const handle =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }

export const errorMiddleware: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) return next(error)
  if (isHttpError(error)) {
    return res.status(error.status).json({ message: error.message, ...error.extra })
  }
  if ((error as { type?: string } | null)?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'ساختار JSON ارسال‌شده معتبر نیست' })
  }
  console.error(error)
  return res.status(500).json({ message: 'خطای داخلی سرور' })
}
