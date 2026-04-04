const express = require('express');
const { body, param } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const { list, create, remove } = require('../controllers/adminUsersController');

const router = express.Router();

router.get('/', authRequired, list);

router.post(
  '/',
  authRequired,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  create
);

router.delete('/:id', authRequired, [param('id').isMongoId()], remove);

module.exports = router;
