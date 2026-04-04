import Expense from '../models/Expense.js';
import Project from '../models/Project.js';

export const createExpense = async (req, res) => {
    try {
        const { project, amount, description } = req.body;
        
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const expense = new Expense({ project, amount, description });
        const createdExpense = await expense.save();
        res.status(201).json(createdExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
