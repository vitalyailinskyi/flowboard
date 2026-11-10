import { loginSchema, registerSchema } from '@app/shared';
import { Router } from 'express';
import { validate } from '../../common/validate';
import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), controller.register);
authRouter.post('/login', validate(loginSchema), controller.login);
