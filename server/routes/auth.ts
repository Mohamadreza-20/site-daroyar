import { Router } from 'express'
import type { Db } from '../types.ts'
import { createSession, publicUser, requireUser } from '../lib/context.js'
import { fail, handle } from '../lib/errors.js'
import { hashPassword, verifyPassword } from '../lib/passwords.js'
import { loginSchema, parse, profileSchema, registerSchema } from '../lib/schemas.js'

const ATTEMPT_WINDOW_MS = 60_000
const MAX_ATTEMPTS = 8
const attempts = new Map<string, number[]>()

function checkRateLimit(key: string) {
  const now = Date.now()
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < ATTEMPT_WINDOW_MS)
  attempts.set(key, recent)
  if (recent.length >= MAX_ATTEMPTS) {
    fail(429, 'تعداد تلاش‌های ناموفق زیاد است؛ یک دقیقه بعد دوباره امتحان کنید.')
  }
  return () => attempts.set(key, [...recent, now])
}

export function authRoutes(db: Db) {
  const router = Router()
  const users = () => db.get('users')

  router.post(
    '/auth/login',
    handle(async (req, res) => {
      const { username, password } = parse(loginSchema, req.body)
      const key = username.toLowerCase()
      const recordFailure = checkRateLimit(key)
      const user = users()
        .value()
        .find((u) => u.username.toLowerCase() === key || u.email === key)
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        recordFailure()
        fail(401, 'نام کاربری یا گذرواژه اشتباه است', { code: 'INVALID_CREDENTIALS' })
      }
      attempts.delete(key)
      res.json({ user: publicUser(user), ...createSession(db, user.id) })
    }),
  )

  router.post(
    '/auth/register',
    handle(async (req, res) => {
      const { password, ...values } = parse(registerSchema, req.body)
      const all = users().value()
      const errors: Record<string, string> = {}
      if (all.some((u) => u.username.toLowerCase() === values.username.toLowerCase())) {
        errors.username = 'این نام کاربری قبلاً ثبت شده است'
      }
      if (all.some((u) => u.email === values.email)) errors.email = 'این ایمیل قبلاً ثبت شده است'
      if (Object.keys(errors).length) fail(409, Object.values(errors)[0] as string, { errors })

      const user = users()
        .insert({
          ...values,
          role: 'customer',
          image: '',
          createdAt: new Date().toISOString(),
          passwordHash: await hashPassword(password),
        })
        .write()
      res.status(201).json({ user: publicUser(user), ...createSession(db, user.id) })
    }),
  )

  router.post(
    '/auth/logout',
    handle((req, res) => {
      if (req.token) db.get('sessions').remove({ id: req.token }).write()
      res.status(204).end()
    }),
  )

  router.get(
    '/auth/me',
    handle((req, res) => {
      const user = requireUser(req)
      const session = db
        .get('sessions')
        .find({ id: req.token ?? '' })
        .value()
      res.json({ user: publicUser(user), expiresAt: session?.expiresAt })
    }),
  )

  router.patch(
    '/auth/me',
    handle((req, res) => {
      const user = requireUser(req)
      const values = parse(profileSchema, req.body)
      if (
        users()
          .value()
          .some((u) => u.id !== user.id && u.email === values.email)
      ) {
        fail(409, 'این ایمیل قبلاً برای حساب دیگری ثبت شده است', {
          errors: { email: 'این ایمیل قبلاً برای حساب دیگری ثبت شده است' },
        })
      }
      const updated = users().find({ id: user.id }).assign(values).write()
      res.json({ user: publicUser(updated) })
    }),
  )

  return router
}
