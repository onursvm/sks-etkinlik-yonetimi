const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body,param,validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');

// express-mongo-sanitize kaldırıldı (veya daha düşük bir sürüm kullanın)
const securityMiddleware = (app) => {
  app.use(helmet());
  //app.use(mongoSanitize());
 const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/\$|\{|\}|\./g, '');
      }
    }
  }
  next();
};
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
  });
  app.use(limiter);
};

// Doğrulama kuralları
const validationRules = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty().trim().escape()
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  event: [
    body('title').notEmpty().trim().escape(),
    body('date').isISO8601(),
    body('description').optional().trim().escape()
  ],
  idParam: [
  param('id').isMongoId().withMessage('Geçersiz ID formatı')
],
  unitIdParam: [
    param('unitId').isMongoId().withMessage('Geçersiz Unit ID formatı')
  ],
  userIdParam: [
    param('userId').isMongoId().withMessage('Geçersiz User ID formatı')
  ]
};

// Doğrulama hatalarını işle
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(422).json({ errors: errors.array() });
};


module.exports = { securityMiddleware, validationRules, validate };