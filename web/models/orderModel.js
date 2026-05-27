// In-memory volatile storage for orders
const orders = [];

// Generate a random ID 
const generateId = () => {
    return 'order_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

const Order = {
    // Retrieves all orders (we will filter this by user in the controller)
    getAll: () => {
        return orders;
    },

    // Creates a new order object and stores it
    create: (userId, restaurantId, items) => {
        const newOrder = {
            id: generateId(),
            userId: userId, 
            restaurantId: restaurantId,
            items: items || [], // Array of objects like { productId: "prod_123", quantity: 2 }
            status: 'Pending', 
            createdAt: new Date().toISOString()
        };
        orders.push(newOrder);
        return newOrder;
    },

    // Finds a specific order by ID 
    getById: (id) => {
        return orders.find(order => order.id === id);
    }
};

module.exports = Order;