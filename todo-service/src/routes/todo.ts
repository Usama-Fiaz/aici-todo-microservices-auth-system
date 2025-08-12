import { Router } from 'express';
import { 
  createTodo, 
  getTodos, 
  updateTodo, 
  deleteTodo 
} from '../controllers/todoController';
import { authenticateToken } from '../middleware/auth';
import { validateTodo } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD operations
router.post('/', validateTodo, createTodo);
router.get('/', getTodos);
router.put('/:id', validateTodo, updateTodo);
router.delete('/:id', deleteTodo);

export { router as todoRoutes }; 