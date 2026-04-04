import express from 'express';
import { createExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('Manager'), createExpense);
router.delete('/:id', protect, authorizeRoles('Manager'), deleteExpense);

export default router;
