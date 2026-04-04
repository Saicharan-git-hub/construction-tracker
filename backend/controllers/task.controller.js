import Task from '../models/Task.js';

export const createTask = async (req, res) => {
    try {
        const task = new Task(req.body);
        const createdTask = await task.save();
        res.status(201).json(createdTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { status, progressPercentage } = req.body;
        
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        // Engineers and Managers can update task status and progress
        if (req.user.role === 'Engineer' || req.user.role === 'Manager') {
            if (status) task.status = status;
            if (progressPercentage !== undefined) task.progressPercentage = progressPercentage;
            
            // if completed, progress is 100
            if (task.status === 'Completed') task.progressPercentage = 100;
            
            const updatedTask = await task.save();
            res.json(updatedTask);
        } else {
            res.status(403).json({ message: 'Not authorized to update this task' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
