import { registerSchema } from '@app/shared';
import express from 'express';
import { errorHandler } from './common/errorHandler';
import { validate } from './common/validate';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true }));
app.post('/test', validate(registerSchema), (req, res) => res.json(req.body));

app.use(errorHandler);
app.listen(4000, () => console.log('Server is running on http://localhost:4000'));
