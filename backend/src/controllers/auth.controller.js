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
        hashedPassword
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

module.exports = {
    registerUser
};