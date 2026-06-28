const router = require('express').Router();
const { checkIn, checkOut, getForEmployee, getAll, getTodayStatus } = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/employee/:employeeId', getForEmployee);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), getAll);

module.exports = router;
