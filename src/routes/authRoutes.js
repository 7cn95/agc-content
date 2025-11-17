const router = require('express').Router();
const { login, loginValidators } = require('../controllers/authController');

router.post('/login', loginValidators, login);

module.exports = router;