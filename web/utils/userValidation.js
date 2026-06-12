// Registration field validators for POST /api/users.
// Each function returns null when valid, or an error message string when invalid.

const validateUsername = (username) => {
    if (typeof username !== 'string' || username.trim() === '') {
        return 'Username is required';
    }
    return null;
};

const validateName = (name) => {
    if (typeof name !== 'string' || name.trim() === '') {
        return 'Name is required';
    }
    return null;
};

const validatePassword = (password) => {
    if (typeof password !== 'string' || password === '') {
        return 'Password is required';
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters and include uppercase, lowercase, and a digit';
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return 'Password must be at least 8 characters and include uppercase, lowercase, and a digit';
    }

    return null;
};

// profileImage is optional. If the client sends it, it must be a non-empty string.
const validateProfileImage = (profileImage) => {
    if (profileImage === undefined || profileImage === null) {
        return null;
    }

    if (typeof profileImage !== 'string' || profileImage.trim() === '') {
        return 'profileImage must be a non-empty string';
    }

    return null;
};

// Location validation for X, Y coordinates
const validateLocation = (location) => {
    if (location !== undefined) {
        if (typeof location !== 'object' || location === null) {
            return "Location must be an object with x and y coordinates";
        }
        if (typeof location.x !== 'number' || typeof location.y !== 'number') {
            return "Location must include valid numeric x and y coordinates";
        }
    }
    return null;
};

const validateRole = (role) => {
    if (role !== undefined && role !== 'customer' && role !== 'restaurant_owner') {
        return "Role must be either 'customer' or 'restaurant_owner'";
    }
    return null;
};

module.exports = {
    validateUsername,
    validatePassword,
    validateName,
    validateProfileImage,
    validateLocation,
    validateRole
};
