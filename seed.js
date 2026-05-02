require('dotenv').config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const User = require("./models/user");
const { faker } = require('@faker-js/faker');

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const categories = ["Beach", "Mountain", "City", "Desert", "Forest", "Snow", "Historical"];

// Example image URLs for categories
const imageMap = {
    "Beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    "Mountain": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    "City": "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80",
    "Desert": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    "Forest": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    "Snow": "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=800&q=80",
    "Historical": "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80"
};

main()
  .then(() => {
      console.log("Connected to MongoDB for Seeding");
      seedData();
  })
  .catch((err) => {
      console.log("MongoDB connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

async function seedData() {
    try {
        // Find an owner or create one if it doesn't exist
        let owner = await User.findOne({ role: 'owner' });
        if (!owner) {
            console.log("No owner found. Creating a default owner account...");
            const newOwner = new User({ email: 'owner@seed.com', username: 'seed_owner', role: 'owner' });
            owner = await User.register(newOwner, 'password123');
        }

        console.log(`Using owner: ${owner.username} (${owner._id})`);

        let listingsToAdd = [];

        for (let category of categories) {
            console.log(`Generating 30 listings for category: ${category}`);
            for (let i = 0; i < 30; i++) {
                let location = faker.location.city();
                let country = faker.location.country();
                
                let listing = new Listing({
                    title: `${faker.word.adjective()} ${category} Getaway`,
                    description: faker.lorem.paragraph(),
                    image: {
                        url: imageMap[category],
                        filename: `listingimage-${Date.now()}`
                    },
                    price: faker.number.int({ min: 1000, max: 20000 }),
                    location: location,
                    country: country,
                    category: category,
                    owner: owner._id,
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            faker.location.longitude(),
                            faker.location.latitude()
                        ]
                    }
                });
                
                listingsToAdd.push(listing);
            }
        }

        // Wait to save all of them
        await Listing.insertMany(listingsToAdd);
        console.log("Successfully seeded 210 listings!");

    } catch (e) {
        console.error("Error seeding data:", e);
    } finally {
        mongoose.connection.close();
    }
}
