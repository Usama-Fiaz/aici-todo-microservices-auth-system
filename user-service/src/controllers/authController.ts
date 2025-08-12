import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { user_email: email }
    });

    if (existingUser) {
      const error = new Error('Email already registered') as AppError;
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await prisma.user.create({
      data: {
        uuid: uuidv4(),
        user_email: email,
        user_pwd: hashedPassword
      },
      select: {
        uuid: true,
        user_email: true,
        created_at: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { user_email: email }
    });

    if (!user) {
      const error = new Error('Invalid credentials') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.user_pwd);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const jwtSecret = process.env['JWT_SECRET'] || 'fallback-secret';
    const jwtExpiresIn = process.env['JWT_EXPIRES_IN'] || '24h';

    const token = jwt.sign(
      { 
        uuid: user.uuid, 
        email: user.user_email 
      },
      jwtSecret as string
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          uuid: user.uuid,
          email: user.user_email
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
}; 