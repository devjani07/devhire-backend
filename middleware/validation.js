const { body, validationResult } = require('express-validator');

const applicationValidationRules = () => {
  return [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('yearsOfExperience').isInt({ min: 0 }).withMessage('Valid experience required'),
    body('portfolioUrl').trim().isURL().withMessage('Valid URL required'),
    body('coverLetter').trim().notEmpty().withMessage('Cover letter is required'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  applicationValidationRules,
  validate,
};