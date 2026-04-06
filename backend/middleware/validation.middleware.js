import Joi from 'joi';

export const validateProject = (req, res, next) => {
    const schema = Joi.object({
        projectName: Joi.string().required(),
        description: Joi.string().allow(''),
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required(),
        budget: Joi.number().positive().required(),
        status: Joi.string().valid('Planning', 'In Progress', 'Completed', 'On Hold')
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }
    next();
};

export const validateTask = (req, res, next) => {
    const schema = Joi.object({
        taskName: Joi.string().required(),
        project: Joi.string().required(), // ObjectId string
        assignedTo: Joi.string().allow('', null),
        deadline: Joi.date().required(),
        priority: Joi.string().valid('Low', 'Medium', 'High'),
        status: Joi.string().valid('Pending', 'In Progress', 'Completed'),
        progressPercentage: Joi.number().min(0).max(100)
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }
    next();
};

export const validateTaskUpdate = (req, res, next) => {
    const schema = Joi.object({
        taskName: Joi.string(),
        assignedTo: Joi.string().allow('', null),
        deadline: Joi.date(),
        priority: Joi.string().valid('Low', 'Medium', 'High'),
        status: Joi.string().valid('Pending', 'In Progress', 'Completed'),
        progressPercentage: Joi.number().min(0).max(100)
    }).min(1); // Require at least one field to update

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }
    next();
};

export const validateExpense = (req, res, next) => {
    const schema = Joi.object({
        project: Joi.string().required(),
        amount: Joi.number().positive().required(),
        description: Joi.string().required(),
        date: Joi.date()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
    }
    next();
};
