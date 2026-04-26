import mongoose from 'mongoose';

mongoose.connect('mongodb://admin:admin123@ac-vkid4er-shard-00-00.elzuymn.mongodb.net:27017,ac-vkid4er-shard-00-01.elzuymn.mongodb.net:27017,ac-vkid4er-shard-00-02.elzuymn.mongodb.net:27017/?ssl=true&replicaSet=atlas-fqb6pf-shard-0&authSource=admin&appName=construction-progress').then(async () => {
    const Project = mongoose.model('Project', new mongoose.Schema({ budget: Number, projectName: String }));
    await Project.create({ budget: 0, projectName: 'Test' });
    try {
        const res = await Project.aggregate([
            { $addFields: { totalExpense: 0, totalTasks: 0, completedTasks: 0 } },
            { 
                $addFields: { 
                    budgetUtilized: { 
                        $cond: [{ $gt: ['$budget', 0] }, { $multiply: [{ $divide: ['$totalExpense', '$budget'] }, 100] }, 0] 
                    }, 
                    completionPercentage: { 
                        $cond: [{ $gt: ['$totalTasks', 0] }, { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 0] 
                    } 
                } 
            }
        ]);
        console.log('SUCCESS', res); 
    } catch (err) {
        console.error('ERROR:', err); 
    } finally {
        await Project.deleteMany({projectName: 'Test'});
        process.exit(0); 
    }
});
