// MongoDB connection and one-time restaurant seed on first startup.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config');

const seedRestaurantsIfEmpty = async () => {
    // Models must be registered before seeding.
    const { Restaurant } = require('./models/restaurantModel');
    const count = await Restaurant.countDocuments();
    if (count > 0) {
        console.log('DB already has restaurants, skipping seed');
        return;
    }

    const filePath = path.join(__dirname, 'data', 'restaurants.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Preserve string ids from seed JSON as MongoDB _id values.
    const seedData = raw.map((restaurant) => ({
        ...restaurant,
        _id: restaurant.id,
    }));

    await Restaurant.insertMany(seedData);
    console.log(`Seeded ${seedData.length} restaurants`);
};

const connect = async () => {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('MongoDB connected');
        await seedRestaurantsIfEmpty();
    } catch (err) {
        console.error('FATAL: MongoDB connection failed', err.message);
        process.exit(1);
    }
};

module.exports = { connect };
