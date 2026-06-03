const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const Service = require('./models/Service');

const seedServices = async () => {
  try {
    // Connect to database
    await connectDB();

    // Read services file
    const servicesFilePath = path.join(__dirname, '..', 'laundry-service.services.json');
    if (!fs.existsSync(servicesFilePath)) {
      console.error(`Services file not found at ${servicesFilePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(servicesFilePath, 'utf8');
    const servicesJson = JSON.parse(rawData);

    // Transform MongoDB export format to standard documents
    const services = servicesJson.map(item => ({
      _id: new mongoose.Types.ObjectId(item._id.$oid),
      name: item.name,
      price: item.price,
      description: item.description,
      icon: item.icon,
      createdAt: item.createdAt?.$date ? new Date(item.createdAt.$date) : new Date(),
      updatedAt: item.updatedAt?.$date ? new Date(item.updatedAt.$date) : new Date()
    }));

    // Clear existing services to avoid duplicates
    await Service.deleteMany({});
    console.log('Cleared existing services.');

    // Insert new services
    const createdServices = await Service.insertMany(services);
    console.log(`Successfully seeded ${createdServices.length} services!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();
