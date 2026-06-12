// In-memory array to store our users
const users = [];

// A simple manual hash function 
const manualHash = (password) => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(); 
};

// Generate a random ID 
const generateId = () => {
    return 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

const User = {
    create: (userData) => {
        const newUser = {
            id: generateId(), 
            username: userData.username, 
            password: manualHash(userData.password), // Stored as a hash
            name: userData.name,
            phone: userData.phone,
            address: userData.address,
            location: userData.location || { x: 0, y: 0 },
            profileImage: userData.profileImage || null,
        };
        users.push(newUser);
        return newUser;
    },
    
    findByUsername: (username) => {
        return users.find(user => user.username === username);
    },

    findById: (id) => {
        return users.find(user => user.id === id);
    },
    validateLogin: (username, rawPassword) => {
        const user = users.find(u => u.username === username);
        
        // If the user doesn't exist, or the hashes don't match, return null
        if (!user || user.password !== manualHash(rawPassword)) {
            return null;
        }
        
        return user; // Credentials are valid!
    }
};


module.exports = User;