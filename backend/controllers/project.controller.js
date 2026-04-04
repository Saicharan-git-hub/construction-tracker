import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Expense from '../models/Expense.js';

export const createProject = async (req, res) => {
    try {
        const project = new Project(req.body);
        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({});
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        
        const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name email');
        const expenses = await Expense.find({ project: project._id });
        
        let totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        let budgetUtilized = project.budget > 0 ? (totalExpense / project.budget) * 100 : 0;
        
        let totalTasks = tasks.length;
        let completedTasks = tasks.filter(t => t.status === 'Completed').length;
        let completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        res.json({ project, tasks, expenses, totalExpense, budgetUtilized, completionPercentage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        await Task.deleteMany({ project: req.params.id });
        await Expense.deleteMany({ project: req.params.id });
        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
