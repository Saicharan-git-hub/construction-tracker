import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true },
    status: { type: String, enum: ['Planning', 'In Progress', 'Completed', 'On Hold'], default: 'Planning' },
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
