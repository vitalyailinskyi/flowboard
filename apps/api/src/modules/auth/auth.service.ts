import argon2 from 'argon2';
import type { RegisterInput } from '@app/shared';
import { AppError } from '../../common/AppError';
import { db } from '../../prisma/db';

export async function register({ email, password }: RegisterInput) {
	const exists = await db.orm.public.User.where({ email }).first();
	if (exists) throw new AppError(409, 'Email already in use');

	const passwordHash = await argon2.hash(password);
	const user = await db.orm.public.User.select('id', 'email', 'name').create({
		email,
		passwordHash,
	});
	return user;
}
