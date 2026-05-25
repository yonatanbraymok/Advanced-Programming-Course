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
            address: userData.address
        };
        users.push(newUser);
        return newUser;
    },
    
    findByUsername: (username) => {
        return users.find(user => user.username === username);
    },

    findById: (id) => {
        return users.find(user => user.id === id);
    }
};

module.exports = User;