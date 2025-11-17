const router = require('express').Router();
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');

router.use(authMiddleware);

router.post('/register-token', ctrl.tokenValidators, ctrl.registerToken);
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettingsValidators, ctrl.updateSettings);
router.post('/trigger-expiring', adminOnly, ctrl.triggerExpiring);

module.exports = router;