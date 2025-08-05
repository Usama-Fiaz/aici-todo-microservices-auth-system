import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

const todoSchema = Joi.object({
  content: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'Todo content cannot be empty',
    'string.min': 'Todo content must be at least 1 character long',
    'string.max': 'Todo content cannot exceed 500 characters',
    'any.required': 'Todo content is required'
  })
});

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