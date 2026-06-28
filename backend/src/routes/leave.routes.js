const router = require('express').Router();
const { create, review, getForEmployee, getAll } = require('../controllers/leave.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.post('/', create);
router.patch('/:id/review', authorize('ADMIN', 'HR', 'MANAGER'), review);
router.get('/employee/:employeeId', getForEmployee);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), getAll);

module.exports = router;
