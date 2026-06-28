const router = require('express').Router();
const { create, assign, updateProgress, getForEmployee, getForDept, getAll } = require('../controllers/training.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.post('/', authorize('ADMIN', 'HR'), create);
router.post('/assign', authorize('ADMIN', 'HR'), assign);
router.patch('/enrollment/:id', updateProgress);
router.get('/employee/:employeeId', getForEmployee);
router.get('/department/:departmentId', getForDept);
router.get('/', getAll);

module.exports = router;
