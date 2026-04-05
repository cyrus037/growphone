const express = require('express');
const { body, param } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const {
  list,
  create,
  update,
  remove,
  activate,
} = require('../controllers/emailTemplatesController');

const router = express.Router();

router.get('/', authRequired, list);

router.post(
  '/',
  authRequired,
  [
    body('name').trim().notEmpty(),
    body('subject').trim().notEmpty(),
    body('htmlContent').isString().notEmpty(),
    body('usage').isIn(['contact_confirmation', 'contact_admin']),
    body('isActive').optional().isBoolean(),
  ],
  create
);

router.patch(
  '/:id',
  authRequired,
  [param('id').isMongoId()],
  [
    body('name').optional().trim().notEmpty(),
    body('subject').optional().trim().notEmpty(),
    body('htmlContent').optional().isString(),
    body('usage').optional().isIn(['contact_confirmation', 'contact_admin']),
    body('isActive').optional().isBoolean(),
  ],
  update
);

router.post('/:id/activate', authRequired, [param('id').isMongoId()], activate);

router.delete('/:id', authRequired, [param('id').isMongoId()], remove);

module.exports = router;
