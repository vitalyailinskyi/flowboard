import type { RequestHandler } from 'express';
import * as authService from './auth.service';

export const register: RequestHandler = async (req, res) => {
	const user = await authService.register(req.body);
	res.status(201).json({ user });
};

// export const login: RequestHandler = async (req, res) => {
// 	const user = await authService.login(req.body);
// 	res.status(200).json({ user });
// };
