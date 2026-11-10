import { Router } from 'express';
import { registerSchema } from '@app/shared';
import { validate } from '../../common/validate';
import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), controller.register);