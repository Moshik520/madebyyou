import { SignJWT, jwtVerify } from 'jose';
import { config } from '../../platform/config.js';
import { UnauthorizedError } from '../../platform/errors.js';

const secret = new TextEncoder().encode(config.JWT_SECRET);

export function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(config.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.sub !== 'string') {
      throw new UnauthorizedError('Invalid token');
    }

    return payload.sub;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError('Invalid or expired token');
  }
}
