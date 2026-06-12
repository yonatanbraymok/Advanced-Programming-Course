const User = require('../models/userModel');
const { signToken } = require('../utils/jwt');

const loginUser = (req, res) => {
    const { username, password } = req.body;

    // 1. Validate that input was provided
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    // 2. Validate credentials against the in-memory model
    const validUser = User.validateLogin(username, password);

    // 3. Handle invalid credentials (401 Unauthorized is standard here)
    if (!validUser) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    // 4. Return a JWT so the client can send it on future protected requests.
    const token = signToken({
        userId: validUser.id,
        username: validUser.username,
    });

    res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: validUser.id,
            username: validUser.username,
            name: validUser.name,
            profileImage: validUser.profileImage
        }
    });
};

module.exports = {
    loginUser
};