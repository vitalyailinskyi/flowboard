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

export async function refresh(rawToken?: string) {
  if (!rawToken) throw new AppError(401, 'No refresh token');
  const tokens = db.orm.public.RefreshToken;

  const stored = await tokens.where({ tokenHash: hashToken(rawToken) }).first();
  if (!stored) throw new AppError(401, 'Invalid refresh token');

  if (stored.revokedAt) {
    await tokens.where({ userId: stored.userId }).deleteAll();
    throw new AppError(401, 'Refresh token reuse detected');
  }
  if (new Date(stored.expiresAt) < new Date()) {
    throw new AppError(401, 'Refresh token expired');
  }

  await tokens.where({ id: stored.id }).update({ revokedAt: new Date().toISOString() });

  const user = await db.orm.public.User.where({ id: stored.userId })
    .select('id', 'email', 'name')
    .first();
  if (!user) throw new AppError(401, 'User not found');
  return { user, ...(await issueTokens(user.id)) };
}

export async function logout(rawToken?: string) {
  if (!rawToken) return;
  await db.orm.public.RefreshToken.where({ tokenHash: hashToken(rawToken) }).delete();
}

export async function getMe(userId: number) {
  const user = await db.orm.public.User.where({ id: userId }).select('id', 'email', 'name').first();
  if (!user) throw new AppError(401, 'User not found');
  return user;
}
