const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authorize('ADMIN', 'HR'), create);
router.put('/:id', authorize('ADMIN', 'HR'), update);
router.delete('/:id', authorize('ADMIN'), remove);

module.exports = router;
