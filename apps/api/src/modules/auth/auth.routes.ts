import { loginSchema, registerSchema } from '@app/shared';
import { Router } from 'express';
import { requireAuth } from '../../common/requireAuth';
import { validate } from '../../common/validate';
import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), controller.register);
authRouter.post('/login', validate(loginSchema), controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', controller.logout);
authRouter.get('/me', requireAuth, controller.me);
