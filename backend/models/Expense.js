import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
