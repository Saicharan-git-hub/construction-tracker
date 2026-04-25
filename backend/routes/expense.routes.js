import express from 'express';
import { createExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateExpense } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('Manager', 'Engineer'), validateExpense, createExpense);
router.delete('/:id', protect, authorizeRoles('Manager', 'Engineer'), deleteExpense);

export default router;
