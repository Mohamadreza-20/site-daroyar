import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 32

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt}$${key.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored ?? '').split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const key = await scryptAsync(password, salt, KEY_LENGTH)
  const expected = Buffer.from(hash, 'hex')
  return expected.length === key.length && timingSafeEqual(expected, key)
}
