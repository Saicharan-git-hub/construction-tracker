import express from 'express';
import { createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateTask, validateTaskUpdate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('Manager', 'Engineer'), validateTask, createTask);
router.put('/:id', protect, authorizeRoles('Manager', 'Engineer'), validateTaskUpdate, updateTask);
router.delete('/:id', protect, authorizeRoles('Manager', 'Engineer'), deleteTask);

export default router;
