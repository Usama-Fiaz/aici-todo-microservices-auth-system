import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

interface JwtPayload {
  uuid: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const error = new Error('Access token required') as AppError;
    error.statusCode = 401;
    next(error);
    return;
  }

  try {
    const jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    const appError = new Error('Invalid or expired token') as AppError;
    appError.statusCode = 401;
    next(appError);
  }
}; 