const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    try {
        const { fullName, email, password, userName, profileName } = req.body;

        // Validation
        if (!fullName || !email || !password || !userName || !profileName) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (typeof fullName !== 'string' || fullName.trim() === '') {
            return res.status(400).json({ message: 'Full name must be a non-empty string.' });
        }

        if (typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ message: 'Valid email is required.' });
        }

        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        if (typeof userName !== 'string' || userName.trim() === '') {
            return res.status(400).json({ message: 'Username must be a non-empty string.' });
        }

        if (typeof profileName !== 'string' || profileName.trim() === '') {
            return res.status(400).json({ message: 'Profile name must be a non-empty string.' });
        }

        // Check if email already exists
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Check if username already exists
        const isUserNameExist = await userModel.findOne({ userName: userName.toLowerCase() });
        if (isUserNameExist) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await userModel.create({
            fullName: fullName.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            userName: userName.toLowerCase(),
            profileName: profileName.trim()
        });

        // Generate JWT token
        const token = jwt.sign({
            id: newUser._id
        }, process.env.JWT_SECRET);

        res.cookie('token', token);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                userName: newUser.userName,
                profileName: newUser.profileName
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: 'Internal server error during registration.' });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        if (typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ message: 'Valid email is required.' });
        }

        if (typeof password !== 'string' || password === '') {
            return res.status(400).json({ message: 'Password is required.' });
        }

        // Check if user exists
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_SECRET);

        res.cookie('token', token);

        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                userName: user.userName,
                profileName: user.profileName
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
}

async function logoutUser(req, res) {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Internal server error during logout.' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};