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
    },

    // Updates mutable order fields (status/items) and returns the updated object.
    update: (id, patchData) => {
        const order = orders.find(currentOrder => currentOrder.id === id);
        if (!order) {
            return null;
        }

        // If the status is provided, update the status
        if (Object.prototype.hasOwnProperty.call(patchData, 'status')) {
            order.status = patchData.status;
        }

        // If the items are provided, update the items
        if (Object.prototype.hasOwnProperty.call(patchData, 'items')) {
            order.items = patchData.items;
        }

        return order;
    },

    // Removes an order by id and returns true only when deletion happened.
    remove: (id) => {
        const index = orders.findIndex(order => order.id === id);
        if (index === -1) {
            return false;
        }

        orders.splice(index, 1);
        return true;
    }
};

module.exports = Order;