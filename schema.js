const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error("string.escapeHTML", { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);
const date = new Date();
const currentYear = date.getFullYear();

module.exports.bookSchema = Joi.object({
    book: Joi.object({
        title: Joi.string().required().escapeHTML(),
        description: Joi.string(),
        publicationYear: Joi.number()
        .integer().min(1900)
        .max(currentYear)
        .required(),
        price: Joi.number().min(0).required(),
        isInStock: Joi.boolean().required(),
    }),
    deleteImages: Joi.array(),
});


module.exports.authorSchema = Joi.object({
    author: Joi.object({
        fullname: Joi.string().required().escapeHTML(),
        age: Joi.number()
        .integer().min(1900)
        .max(currentYear).required(),
        hometown: Joi.string().required().escapeHTML(),
    }),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});


