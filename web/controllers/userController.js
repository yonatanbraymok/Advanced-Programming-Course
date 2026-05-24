const User = require('../models/userModel');

const registerUser = (req, res) => {
    const { username, password, name, phone, address } = req.body;

    // Validate all fields exist
    if (!username || !password || !name || !phone || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username is already taken
    const existingUser = User.findByUsername(username);
    if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
    }

    // Create the user in our model
    const newUser = User.create({ username, password, name, phone, address });

    // Return success status and the new ID
    res.status(201).json({
        message: "User created successfully",
        userId: newUser.id
    });
};

const getUserProfile = (req, res) => {
    const userId = req.params.id; // Get the ID from the URL

    // Find the user in our model
    const user = User.findById(userId);

    // Handle if user doesn't exist
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Strip the password out so we don't leak it to the client
    const { password, ...safeUserProfile } = user;

    // Return the clean profile data
    res.status(200).json(safeUserProfile);
};

module.exports = {
    registerUser,
    getUserProfile 
};