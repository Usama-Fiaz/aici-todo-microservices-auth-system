import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

const todoSchema = Joi.object({
  content: Joi.string().min(1).max(500).optional().messages({
    'string.empty': 'Todo content cannot be empty',
    'string.min': 'Todo content must be at least 1 character long',
    'string.max': 'Todo content cannot exceed 500 characters'
  }),
  completed: Joi.boolean().optional()
}).or('content', 'completed');

export const validateTodo = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = todoSchema.validate(req.body);
  
  if (error) {
    const appError = new Error(error.details[0]?.message || 'Validation error') as AppError;
    appError.statusCode = 400;
    next(appError);
    return;
  }
  
  next();
}; 