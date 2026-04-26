import mongoose from 'mongoose';

mongoose.connect('mongodb://admin:admin123@ac-vkid4er-shard-00-00.elzuymn.mongodb.net:27017,ac-vkid4er-shard-00-01.elzuymn.mongodb.net:27017,ac-vkid4er-shard-00-02.elzuymn.mongodb.net:27017/?ssl=true&replicaSet=atlas-fqb6pf-shard-0&authSource=admin&appName=construction-progress').then(async () => {
    const Project = mongoose.model('Project', new mongoose.Schema({ budget: Number, projectName: String }, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    try {
        const projects = await Project.find({});
        console.log('Projects:', projects);
        const users = await User.find({});
        console.log('Users:', users);
    } catch (err) {
        console.error('ERROR:', err); 
    } finally {
        process.exit(0); 
    }
});
