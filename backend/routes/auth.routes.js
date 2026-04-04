import express from 'express';
import { registerUser, loginUser, getUsers } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles as roleAuth } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, roleAuth('Manager'), getUsers); 

export default router;
