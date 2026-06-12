const { MongoClient } = require('mongodb');

// Connection URI - adjust the database name at the end if yours differs from wolt
const uri = 'mongodb://127.0.0.1:27017/wolt'; 

const sampleRestaurants = [
  {
    name: 'Burger Palace',
    cuisine: 'Burgers',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    menu: [
      { name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, onions and secret sauce', price: 45, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150' },
      { name: 'Cheese Fries', description: 'Crispy golden fries drenched in melted cheddar cheese layers', price: 22, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150' }
    ]
  },
  {
    name: 'Sushi Zen',
    cuisine: 'Asian',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600',
    menu: [
      { name: 'Salmon Combo Box', description: '8 pieces of premium spicy salmon maki rolls and 4 pieces of nigiri', price: 58, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=150' },
      { name: 'Miso Soup', description: 'Traditional Japanese hot broth with tofu cubes and scallions', price: 15, image: 'https://images.unsplash.com/photo-1542358821-67a3a34421b6?w=150' }
    ]
  },
  {
    name: 'Pizza Bella',
    cuisine: 'Italian',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    menu: [
      { name: 'Margherita Pizza', description: 'Fresh mozzarella cheese, signature tomato sauce, and aromatic basil', price: 50, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150' },
      { name: 'Garlic Bread', description: 'Toasted crispy baguette slices smothered in rich garlic herb butter', price: 18, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=150' }
    ]
  }
];

async function seedDatabase() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // Target the restaurants collection directly
    const collection = db.collection('restaurants');
    
    // Clear existing records to guarantee a clean state for frontend metrics validation
    await collection.deleteMany({});
    
    // Populate the database collection with sample models
    await collection.insertMany(sampleRestaurants);
    console.log('Database seeded successfully with sample restaurants!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
  }
}

seedDatabase();