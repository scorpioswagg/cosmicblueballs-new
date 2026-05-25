import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb } from './mongo';

const SESSION_COOKIE = 'cosmic_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET not set');
  return s;
}

export function signSession(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export function setSessionCookie(payload) {
  const token = signSession(payload);
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const c = cookieStore.get(SESSION_COOKIE);
    if (!c?.value) return null;
    const decoded = verifySession(c.value);
    if (!decoded) return null;
    return {
      id: decoded.id || decoded.email,
      email: decoded.email,
      role: decoded.role || 'user',
      name: decoded.name || null,
    };
  } catch {
    return null;
  }
}

export async function findOrCreateUser(email, name = null, role = 'user') {
  const db = await getDb();
  const users = db.collection('users');
  const existing = await users.findOne({ email });
  if (existing) return existing;
  const doc = {
    id: crypto.randomUUID(),
    email,
    name,
    role,
    createdAt: new Date(),
  };
  await users.insertOne(doc);
  return doc;
}
