const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/lineController');

// =======================
// 1) مسار عام بدون تسجيل دخول
//     GET /api/lines  => قائمة الخطوط للواجهة الرئيسية في Flutter
// =======================
router.get('/', ctrl.getAll);

// =======================
// 2) ما بعد هذا السطر يحتاج auth
// =======================
router.use(authMiddleware);

router.get('/:id', ctrl.getOne);
router.post('/', adminOnly, ctrl.validators, ctrl.create);
router.put('/:id', adminOnly, ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);
router.post('/:id/renew', adminOnly, ctrl.renew);
router.post('/import/csv', adminOnly, upload.single('file'), ctrl.importCsv);

module.exports = router;
