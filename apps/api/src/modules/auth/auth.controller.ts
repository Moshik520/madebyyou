import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schema.js';
import { loginUser, registerUser } from './auth.service.js';

export async function register(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);

  res.status(201).json({ user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);

  res.status(200).json(result);
}
