const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    const {fullName, email, password} = req.body;

    const isUserExist = await userModel.findOne({email});

    if(isUserExist){
        return res.status(400).json({message: 'User already exist'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        fullName, 
        email, 
        password:hashedPassword
    });

    const token = jwt.sign({
        id: newUser._id
    }, process.env.JWT_SECRET);

    res.cookie('token', token);

    // 201 status = new resource created...
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email
            // dont send passowrd to frontend...
        }
    });
}

async function loginUser(req, res) {
    const {email, password} = req.body;

    const isUserExist = await userModel.findOne({email});

    if(!isUserExist){
        return res.status(400).json({message: 'Invalid email or password'});
    }

    const isPasswordValid = await bcrypt.compare(password, isUserExist.password);

    if(!isPasswordValid){
        return res.status(400).json({message: 'Invalid email or password'});
    }

    const token = jwt.sign({
        id: isUserExist._id
    }, process.env.JWT_SECRET);

    res.cookie('token', token);

    // 201 status = new resource created...
    res.status(201).json({
        message: 'User logged in successfully',
        user: {
            id: isUserExist._id,
            fullName: isUserExist.fullName,
            email: isUserExist.email
        }
    });
}

module.exports = {
    registerUser,
    loginUser
};