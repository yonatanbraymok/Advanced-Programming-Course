// In-memory volatile storage for restaurants populated with safe default initial listings
const restaurants = [
  {
    id: 'rest_burger_123',
    name: 'Burger Palace',
    cuisine: 'Burgers',
    rating: 4.8,
    location: { x: 0, y: 0 },
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    menu: [
      { id: 'prod_b1', name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, onions and secret sauce', price: 45, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150' },
      { id: 'prod_b2', name: 'Cheese Fries', description: 'Crispy golden fries drenched in melted cheddar cheese layers', price: 22, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150' }
    ]
  },
  {
    id: 'rest_sushi_456',
    name: 'Sushi Zen',
    cuisine: 'Asian',
    rating: 4.9,
    location: { x: 5, y: 5 },
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600',
    menu: [
      { id: 'prod_s1', name: 'Salmon Combo Box', description: '8 pieces of premium spicy salmon maki rolls and 4 pieces of nigiri', price: 58, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150' },
      { id: 'prod_s2', name: 'Miso Soup', description: 'Traditional Japanese hot broth with tofu cubes and scallions', price: 15, image: 'https://sudachirecipes.com/wp-content/uploads/2021/11/homemade-miso-soup-thumb.png' }
    ]
  },
  {
    id: 'rest_pizza_789',
    name: 'Pizza Bella',
    cuisine: 'Italian',
    rating: 4.6,
    location: { x: 10, y: 10 },
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    menu: [
      { id: 'prod_p1', name: 'Margherita Pizza', description: 'Fresh mozzarella cheese, signature tomato sauce, and aromatic basil', price: 50, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150' },
      { id: 'prod_p2', name: 'Garlic Bread', description: 'Toasted crispy baguette slices smothered in rich garlic herb butter', price: 18, image: 'https://www.nonnabox.com/wp-content/uploads/Garlic-Bread-02-1.webp' }
    ]
  }
];

// Generate a random ID (consistent with userModel)
const generateId = () => {
  return 'rest_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
};

// Retrieves all restaurants from the volatile memory array
const getAll = () => {
  return restaurants;
};

// Creates a new restaurant object, stores it in memory, and returns it
const create = (name, description = '') => {
  const newRestaurant = {
    id: generateId(),
    name: name,
    description: description,
    cuisine: 'International',
    rating: 5.0,
    menu: []
  };
  restaurants.push(newRestaurant);
  return newRestaurant;
};

// Finds a specific restaurant by its unique ID
const getById = (id) => {
  return restaurants.find(r => r.id === id);
};

// Updates an existing restaurant fields
const update = (id, name, description) => {
  const restaurant = getById(id);
  if (!restaurant) return null;

  restaurant.name = name;
  if (description !== undefined) {
    restaurant.description = description;
  } else if (restaurant.description === undefined) {
    restaurant.description = '';
  }
  return restaurant;
};

// Deletes a restaurant from the in-memory array
const remove = (id) => {
  const index = restaurants.findIndex(r => r.id === id);
  if (index === -1) return false;

  restaurants.splice(index, 1);
  return true;
};

module.exports = {
  getAll,
  create,
  getById,
  update,
  remove,
  restaurants
};