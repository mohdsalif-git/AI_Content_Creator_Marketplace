import { argon2id } from 'hash-wasm'
import crypto from 'crypto'

/**
 * Hashes a password using Argon2id with 16-byte cryptographically secure salt.
 * @param {string} password 
 * @returns {Promise<string>} Standard encoded Argon2 string
 */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  return await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 1024,
    hashLength: 32,
    outputType: 'encoded'
  })
}

/**
 * Verifies a password against an encoded Argon2id hash.
 * @param {string} hash 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(hash, password) {
  if (!hash || !password) return false
  try {
    const parts = hash.split('$')
    if (parts.length < 6) return false
    const params = Object.fromEntries(parts[3].split(',').map((p) => p.split('=')))
    const salt = Buffer.from(parts[4], 'base64')
    const calculated = await argon2id({
      password,
      salt,
      parallelism: parseInt(params.p, 10),
      iterations: parseInt(params.t, 10),
      memorySize: parseInt(params.m, 10),
      hashLength: 32,
      outputType: 'encoded'
    })
    return calculated === hash
  } catch (err) {
    return false
  }
}
