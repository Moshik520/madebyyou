import { prisma } from '../../platform/prisma.js';
import { ConflictError } from '../../platform/errors.js';
import { hashPassword } from './password.js';
import type { RegisterInput } from './auth.schema.js';

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  );
}

export async function registerUser(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ConflictError('Email is already registered');
    }
    throw error;
  }
}
