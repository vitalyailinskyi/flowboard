import type { LoginInput, RegisterInput } from '@app/shared';
import argon2 from 'argon2';
import { AppError } from '../../common/AppError';
import { db } from '../../prisma/db';
import { REFRESH_TTL_MS, generateRefreshToken, hashToken, signAccessToken } from './tokens';

async function issueTokens(userId: number) {
  const accessToken = await signAccessToken(userId);
  const refreshToken = generateRefreshToken();
  await db.orm.public.RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS).toISOString(),
  });
  return { accessToken, refreshToken };
}

export async function register({ email, password }: RegisterInput) {
  const exists = await db.orm.public.User.where({ email }).first();
  if (exists) throw new AppError(409, 'Email already in use');

  const passwordHash = await argon2.hash(password);
  const user = await db.orm.public.User.select('id', 'email', 'name').create({
    email,
    passwordHash,
  });
  return { user, ...(await issueTokens(user.id)) };
}

export async function login({ email, password }: LoginInput) {
  const found = await db.orm.public.User.where({ email }).first();
  if (!found || !(await argon2.verify(found.passwordHash, password))) {
    throw new AppError(401, 'Invalid email or password');
  }
  const user = { id: found.id, email: found.email, name: found.name };
  return { user, ...(await issueTokens(user.id)) };
}
