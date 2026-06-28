const router = require('express').Router();
const { getAll, create, assignEmployee } = require('../controllers/department.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', getAll);
router.post('/', authorize('ADMIN', 'HR'), create);
router.patch('/:departmentId/assign/:employeeId', authorize('ADMIN', 'HR'), assignEmployee);

module.exports = router;
