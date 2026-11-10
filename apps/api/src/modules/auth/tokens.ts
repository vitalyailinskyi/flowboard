import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

const secret = new TextEncoder().encode(process.env['JWT_ACCESS_SECRET']);

export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const signAccessToken = (userId: number) =>
  new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return Number(payload.sub);
}

export const generateRefreshToken = () => randomBytes(48).toString('base64url');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
