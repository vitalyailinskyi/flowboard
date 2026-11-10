import type { RequestHandler, Response } from 'express';
import * as authService from './auth.service';
import { REFRESH_TTL_MS } from './tokens';

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    maxAge: REFRESH_TTL_MS,
    path: '/auth',
  });
}

export const register: RequestHandler = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
};

export const login: RequestHandler = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
};

export const refresh: RequestHandler = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.refresh(
    req.cookies['refreshToken'],
  );
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
};

export const logout: RequestHandler = async (req, res) => {
  await authService.logout(req.cookies['refreshToken']);
  res.clearCookie('refreshToken', { path: '/auth' });
  res.status(204).end();
};

export const me: RequestHandler = async (req, res) => {
  res.json({ user: await authService.getMe(req.userId!) });
};
