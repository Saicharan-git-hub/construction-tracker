import express from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateProject } from '../middleware/validation.middleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getProjects)
    .post(protect, authorizeRoles('Manager'), validateProject, createProject);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, authorizeRoles('Manager'), validateProject, updateProject)
    .delete(protect, authorizeRoles('Manager'), deleteProject);

export default router;
