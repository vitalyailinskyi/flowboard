import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { errorHandler } from './common/errorHandler';
import { authRouter } from './modules/auth/auth.routes';

const app = express();
app.use(cors({ origin: process.env['WEB_ORIGIN'], credentials: true }));
app.use(cookieParser());

app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);

app.use(errorHandler);
app.listen(4000, () => console.log('Server is running on http://localhost:4000'));
