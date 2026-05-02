require('dotenv').config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const User = require("./models/user");

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const categories = {
    "Beach": {
        locations: [
            { city: "Goa", country: "India" }, { city: "Andaman", country: "India" }, { city: "Gokarna", country: "India" },
            { city: "Varkala", country: "India" }, { city: "Kovalam", country: "India" }, { city: "Pondicherry", country: "India" },
            { city: "Puri", country: "India" }, { city: "Tarkarli", country: "India" }, { city: "Marari", country: "India" }, { city: "Kochi", country: "India" }
        ]
    },
    "Mountain": {
        locations: [
            { city: "Manali", country: "India" }, { city: "Shimla", country: "India" }, { city: "Darjeeling", country: "India" },
            { city: "Ooty", country: "India" }, { city: "Munnar", country: "India" }, { city: "Leh", country: "India" },
            { city: "Gangtok", country: "India" }, { city: "Mussoorie", country: "India" }, { city: "Nainital", country: "India" }, { city: "Kodaikanal", country: "India" }
        ]
    },
    "City": {
        locations: [
            { city: "Mumbai", country: "India" }, { city: "Delhi", country: "India" }, { city: "Bangalore", country: "India" },
            { city: "Hyderabad", country: "India" }, { city: "Chennai", country: "India" }, { city: "Kolkata", country: "India" },
            { city: "Pune", country: "India" }, { city: "Jaipur", country: "India" }, { city: "Ahmedabad", country: "India" }, { city: "Chandigarh", country: "India" }
        ]
    },
    "Desert": {
        locations: [
            { city: "Jaisalmer", country: "India" }, { city: "Jodhpur", country: "India" }, { city: "Bikaner", country: "India" },
            { city: "Pushkar", country: "India" }, { city: "Kutch", country: "India" }, { city: "Barmer", country: "India" },
            { city: "Osian", country: "India" }, { city: "Mandawa", country: "India" }, { city: "Khimsar", country: "India" }, { city: "Kumbhalgarh", country: "India" }
        ]
    },
    "Forest": {
        locations: [
            { city: "Corbett", country: "India" }, { city: "Ranthambore", country: "India" }, { city: "Kaziranga", country: "India" },
            { city: "Bandipur", country: "India" }, { city: "Kanha", country: "India" }, { city: "Sundarbans", country: "India" },
            { city: "Gir", country: "India" }, { city: "Periyar", country: "India" }, { city: "Tadoba", country: "India" }, { city: "Wayanad", country: "India" }
        ]
    },
    "Snow": {
        locations: [
            { city: "Gulmarg", country: "India" }, { city: "Auli", country: "India" }, { city: "Pahalgam", country: "India" },
            { city: "Rohtang", country: "India" }, { city: "Spiti", country: "India" }, { city: "Sonamarg", country: "India" },
            { city: "Yumthang", country: "India" }, { city: "Patnitop", country: "India" }, { city: "Munsiyari", country: "India" }, { city: "Tawang", country: "India" }
        ]
    },
    "Historical": {
        locations: [
            { city: "Agra", country: "India" }, { city: "Hampi", country: "India" }, { city: "Khajuraho", country: "India" },
            { city: "Varanasi", country: "India" }, { city: "Mysore", country: "India" }, { city: "Fatehpur Sikri", country: "India" },
            { city: "Mahabalipuram", country: "India" }, { city: "Madurai", country: "India" }, { city: "Ajanta", country: "India" }, { city: "Amritsar", country: "India" }
        ]
    }
};

const adjectives = ["Beautiful", "Luxurious", "Cozy", "Stunning", "Peaceful", "Majestic", "Historic", "Modern", "Classic", "Serene"];

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function seedData() {
    try {
        let owner = await User.findOne({ role: 'owner' });
        if (!owner) {
            console.log("No owner found. Creating a default owner account...");
            const newOwner = new User({ email: 'owner@seed.com', username: 'seed_owner', role: 'owner' });
            owner = await User.register(newOwner, 'password123');
        }

        console.log("Deleting old listings...");
        await Listing.deleteMany({}); // Delete all existing listings
        
        let listingsToAdd = [];

        for (let [category, data] of Object.entries(categories)) {
            console.log(`Generating unique realistic listings for category: ${category}`);
            // Iterate exactly once per location to ensure no duplicates
            for (let locationObj of data.locations) {
                let titleAdjective = getRandomItem(adjectives);
                
                // Use loremflickr to pull an image based on the exact city name to get real images!
                let cityQuery = locationObj.city.toLowerCase().replace(/\s+/g, '');
                let imgUrl = `https://loremflickr.com/800/600/${cityQuery},india/all?lock=${Math.floor(Math.random() * 1000)}`;
                
                // Realistic price between $50 and $500
                let price = getRandomInt(50, 500);

                // Fetch real coordinates from Mapbox
                const response = await geocodingClient.forwardGeocode({
                    query: `${locationObj.city}, ${locationObj.country}`,
                    limit: 1,
                }).send();

                let geometry = { type: 'Point', coordinates: [78.9629, 20.5937] }; // Default to center of India
                if (response.body.features.length > 0) {
                    geometry = response.body.features[0].geometry;
                }

                let listing = new Listing({
                    title: `${titleAdjective} Getaway in ${locationObj.city}`,
                    description: `Experience the ultimate ${category.toLowerCase()} vacation. This ${titleAdjective.toLowerCase()} property offers everything you need for a perfect stay. Located centrally in ${locationObj.city}, ${locationObj.country}.`,
                    image: {
                        url: imgUrl,
                        filename: `listingimage-${Date.now()}`
                    },
                    price: price,
                    location: locationObj.city,
                    country: locationObj.country,
                    category: category,
                    owner: owner._id,
                    geometry: geometry
                });
                
                listingsToAdd.push(listing);
            }
        }

        await Listing.insertMany(listingsToAdd);
        console.log("Successfully seeded 70 realistic, perfectly unique listings with real coordinates!");

    } catch (e) {
        console.error("Error seeding data:", e);
    } finally {
        mongoose.connection.close();
    }
}
