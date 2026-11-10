import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email('Введите корректный email'),
	password: z.string().min(8, 'Минимум 8 символов'),
});

export const loginSchema = z.object({
	email: z.string().email('Введите корректный email'),
	password: z.string().min(1, 'Введите пароль'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;