import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../../platform/errors.js';
import { verifyAccessToken } from './token.js';

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = header.slice('Bearer '.length).trim();

    req.userId = await verifyAccessToken(token);

    next();
  } catch (error) {
    next(error);
  }
};
