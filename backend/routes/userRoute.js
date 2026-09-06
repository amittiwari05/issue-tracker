const express = require('express');
const router = express.Router();
const { getUserProfile } = require("../controllers/userController");
const { signup, login } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middlewares/authValidation');
const { protect } = require('../middlewares/auth');

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getUserProfile);

module.exports = router;
