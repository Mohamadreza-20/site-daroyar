import { randomBytes } from 'node:crypto'
import type { RequestHandler, Response } from 'express'
import type { Db, UserRow } from '../types.ts'
import { fail } from './errors.js'

const TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES) || 120

export type PublicUser = Omit<UserRow, 'passwordHash'>

export function publicUser(user: UserRow | null | undefined): PublicUser | null {
  if (!user) return null
  const { passwordHash: _hash, ...rest } = user
  return rest
}

export function createSession(db: Db, userId: number) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString()
  db.get('sessions').push({ id: token, userId, expiresAt }).write()
  return { token, expiresAt }
}

export const attachUser =
  (db: Db): RequestHandler =>
  (req, _res, next) => {
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

interface AuthRequest {
  user: UserRow | null
  sessionExpired: boolean
}

export function requireUser(req: AuthRequest): UserRow {
  if (req.user) return req.user
  if (req.sessionExpired) fail(401, 'نشست شما منقضی شده است؛ دوباره وارد شوید.', { code: 'SESSION_EXPIRED' })
  return fail(401, 'برای ادامه وارد حساب کاربری شوید.', { code: 'UNAUTHENTICATED' })
}

export function requireAdmin(req: AuthRequest): UserRow {
  const user = requireUser(req)
  if (user.role !== 'admin') fail(403, 'اجازهٔ دسترسی به این بخش را ندارید.', { code: 'FORBIDDEN' })
  return user
}

export const qs = (value: unknown): string | undefined => (typeof value === 'string' && value ? value : undefined)

export function setTotalCount(res: Response, total: number): void {
  res.setHeader('X-Total-Count', total)
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
}

interface PageQuery {
  _page?: unknown
  _limit?: unknown
}

export function paginate<T>(items: readonly T[], query: PageQuery, defaultLimit = 10) {
  const page = Math.max(1, parseInt(String(query._page), 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(String(query._limit), 10) || defaultLimit))
  return { page, limit, total: items.length, items: items.slice((page - 1) * limit, page * limit) }
}
