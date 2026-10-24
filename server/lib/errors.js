export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

export const fail = (status, message, extra) => {
  throw new HttpError(status, message, extra)
}

export const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    next(error)
  }
}

export function errorMiddleware(error, _req, res, next) {
  if (res.headersSent) return next(error)
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, ...error.extra })
  }
  if (error?.status === 422 && error.extra) {
    return res.status(422).json({ message: error.message, ...error.extra })
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'ساختار JSON ارسال‌شده معتبر نیست' })
  }
  console.error(error)
  return res.status(500).json({ message: 'خطای داخلی سرور' })
}
