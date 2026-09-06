const Joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required(),
        profilePic: Joi.string().optional().allow('', null),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            error: error.details[0].message,
            success: false,
        });
    }
    next();
};

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(100).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            error: error.details[0].message,
            success: false,
        });
    }
    next();
};

module.exports = { signupValidation, loginValidation };
