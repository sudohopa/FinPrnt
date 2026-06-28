const router = require('express').Router();
const { getDashboard, getNotifications, markRead, generateAiReport } = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), getDashboard);
router.post('/ai', authorize('ADMIN', 'HR', 'MANAGER'), generateAiReport);
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markRead);

module.exports = router;
