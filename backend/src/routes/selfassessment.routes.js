const router = require('express').Router();
const { submit, review, getForEmployee, getAll } = require('../controllers/selfassessment.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.post('/', submit);
router.patch('/:id/review', authorize('ADMIN', 'HR', 'MANAGER'), review);
router.get('/employee/:employeeId', getForEmployee);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), getAll);

module.exports = router;
