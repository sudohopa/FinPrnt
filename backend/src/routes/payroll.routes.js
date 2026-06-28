const router = require('express').Router();
const { create, update, getForEmployee, getAll } = require('../controllers/payroll.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.post('/', authorize('ADMIN', 'HR'), create);
router.put('/:id', authorize('ADMIN', 'HR'), update);
router.get('/employee/:employeeId', getForEmployee);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), getAll);

module.exports = router;
