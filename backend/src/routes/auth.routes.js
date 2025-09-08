const express = require('express');
const { loginUser, registerUser, logoutUser } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/user/login', loginUser);
router.post('/user/register', registerUser);
router.post('/user/logout', logoutUser);

module.exports = router;