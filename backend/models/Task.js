import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
