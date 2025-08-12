import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();

// Register new user
router.post('/register', validateRegistration, register);

// Login user
router.post('/login', validateLogin, login);

export { router as authRoutes }; 