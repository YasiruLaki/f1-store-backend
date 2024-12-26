const mongoose = require('mongoose');

const connectToDB = async () => {
  const uri = process.env.MONGODB_PRODUCT_URI;
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

module.exports = connectToDB;