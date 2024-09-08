const mongoose = require('mongoose');
const connectToDB = require('./connectToDB'); // Adjust the path if needed
const Product = require('../models/Product'); // Import the Product model

exports.handler = async function (event, context) {
  try {
    // Connect to the database
    await connectToDB();

    // Fetch and sort products by category
    const products = await Product.find().sort({ category: 1 }).exec();

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all domains
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(groupedProducts),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all domains
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Error fetching products' }),
    };
  }
};