const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const fetchuser = require('../middleware/fetchuser');
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Create a user via endpoint /api/user/createuser
router.post('/createuser', [
    body('name', 'Please Enter Valid Name').isLength({ min: 3 }),
    body('email', 'Please Enter Valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        // Check if email already exists
        let user = await User.findOne({ email: req.body.email });

        const salt = bcrypt.genSaltSync(10);
        const secPassword = bcrypt.hashSync(req.body.password, salt);

        if (user) {
            success = false;
            return res.status(400).json({ success, error: 'Email already exists' });
        }

        // Create user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPassword,
        });

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

// Login user through email and password via endpoint /api/auth/login
router.post('/login', [
    body('email', 'Please Enter Email').notEmpty(),
    body('email', 'Please Enter Valid Email').isEmail(),
    body('password', 'Please Enter Password').notEmpty()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        // Check for user
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success, error: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success, msg: "Invalid credentials" });
        }

        //Create token
        const payload = {
            user: {
                id: user.id
            }
        };

        const authToken = jwt.sign(payload, JWT_SECRET);
        success = true
        res.status(200).json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})

// Get userdata after validation auth token through middleware via endpoint /api/auth/getuser
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (user) {
            res.status(200).json({ user })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Forgot password option for users who have forgot their password via endpoint /api/auth/forgotpassword
router.post("/forgotpassword", async (req, res) => {
    try {
        const frontendUrl = req.headers.origin;
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.json({ success: false });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `
        You requested a password reset for your iNotebook account.

        Click the link below to reset your password:
        ${resetUrl}

        This link will expire in 10 minutes.

        If you did not request this, please ignore this email.
        `;

        await sendEmail({
            email: user.email,
            subject: "Password Reset - iNotebook",
            message,
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        console.log(error);
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/resetpassword/:token", async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.json({ success: false });
    }

    user.password = bcrypt.hashSync(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ success: true });
});

module.exports = router