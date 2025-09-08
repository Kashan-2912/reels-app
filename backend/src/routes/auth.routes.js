const express = require('express')
const registerUser = require('../controllers/auth.controller').registerUser;

const router = express.Router();

// router.post('/user/login', loginUser);
router.post('/user/register', registerUser);

module.exports = router;