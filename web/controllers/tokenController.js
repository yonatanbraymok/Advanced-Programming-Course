const User = require('../models/userModel');
const { signToken } = require('../utils/jwt');

const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const validUser = await User.validateLogin(username, password);

        if (!validUser) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = signToken({
            userId: validUser.id,
            username: validUser.username,
            role: validUser.role,
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: validUser.id,
                username: validUser.username,
                name: validUser.name,
                profileImage: validUser.profileImage,
                role: validUser.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    loginUser,
};
