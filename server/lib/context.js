import { randomBytes } from 'node:crypto'
import { fail } from './errors.js'

const TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES) || 120

export const publicUser = (user) => {
  if (!user) return null
  const { passwordHash: _hash, ...rest } = user
  return rest
}

export function createSession(db, userId) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString()
  db.get('sessions').push({ id: token, userId, expiresAt }).write()
  return { token, expiresAt }
}

export const attachUser = (db) => (req, _res, next) => {
  const header = req.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  req.token = token
  req.user = null
  req.sessionExpired = false
  if (token) {
    const sessions = db.get('sessions')
    const session = sessions.find({ id: token }).value()
    if (!session || new Date(session.expiresAt) <= new Date()) {
      if (session) sessions.remove({ id: token }).write()
      req.sessionExpired = true
    } else {
      req.user = db.get('users').find({ id: session.userId }).value() ?? null
      req.sessionExpired = !req.user
    }
  }
  next()
}

export function requireUser(req) {
  if (req.user) return req.user
  if (req.sessionExpired) fail(401, 'نشست شما منقضی شده است؛ دوباره وارد شوید.', { code: 'SESSION_EXPIRED' })
  return fail(401, 'برای ادامه وارد حساب کاربری شوید.', { code: 'UNAUTHENTICATED' })
}

export function requireAdmin(req) {
  const user = requireUser(req)
  if (user.role !== 'admin') fail(403, 'اجازهٔ دسترسی به این بخش را ندارید.', { code: 'FORBIDDEN' })
  return user
}

export const setTotalCount = (res, total) => {
  res.setHeader('X-Total-Count', total)
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
}

export function paginate(items, query, defaultLimit = 10) {
  const page = Math.max(1, parseInt(query._page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query._limit, 10) || defaultLimit))
  return { page, limit, total: items.length, items: items.slice((page - 1) * limit, page * limit) }
}
