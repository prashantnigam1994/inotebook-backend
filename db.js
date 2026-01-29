const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectToMongo;