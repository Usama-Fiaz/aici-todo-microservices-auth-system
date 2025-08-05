import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';

interface CreateTodoRequest {
  content: string;
}

interface UpdateTodoRequest {
  content: string;
}

export const createTodo = async (
  req: Request<{}, {}, CreateTodoRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content } = req.body;
    const userUuid = req.user!.uuid;

    const todo = await prisma.todo.create({
      data: {
        uuid: uuidv4(),
        content,
        user_uuid: userUuid
      },
      select: {
        uuid: true,
        content: true,
        user_uuid: true,
        created_at: true,
        updated_at: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

export const getTodos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userUuid = req.user!.uuid;

    const todos = await prisma.todo.findMany({
      where: { user_uuid: userUuid },
      select: {
        uuid: true,
        content: true,
        user_uuid: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: todos
    });
  } catch (error) {
    next(error);
  }
};

export const updateTodo = async (
  req: Request<{ id: string }, {}, UpdateTodoRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userUuid = req.user!.uuid;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        uuid: id,
        user_uuid: userUuid
      }
    });

    if (!existingTodo) {
      const error = new Error('Todo not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    const updatedTodo = await prisma.todo.update({
      where: { uuid: id },
      data: { content },
      select: {
        uuid: true,
        content: true,
        user_uuid: true,
        created_at: true,
        updated_at: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: updatedTodo
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userUuid = req.user!.uuid;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
      where: {
        uuid: id,
        user_uuid: userUuid
      }
    });

    if (!existingTodo) {
      const error = new Error('Todo not found') as AppError;
      error.statusCode = 404;
      throw error;
    }

    await prisma.todo.delete({
      where: { uuid: id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 