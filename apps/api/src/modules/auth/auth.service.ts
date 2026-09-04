import { randomUUID } from 'node:crypto';
import { prisma } from '../../platform/prisma.js';
import { ConflictError, UnauthorizedError } from '../../platform/errors.js';
import { hashPassword, verifyPassword } from './password.js';
import { signAccessToken } from './token.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

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

const dummyHash = hashPassword(randomUUID());

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    await verifyPassword(await dummyHash, input.password);
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatches = await verifyPassword(user.passwordHash, input.password);

  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = await signAccessToken(user.id);

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}
