const mongoose = require('mongoose');
const connectToDB = require('./connectToDB'); // Adjust the path if needed
const Product = require('../models/Product'); // Import the Product model

exports.handler = async function (event, context) {
  try {
    await connectToDB();

    // Get category from query parameters
    const { filteredCategory } = event.queryStringParameters;

    // Fetch and sort products based on the provided category
    const query = filteredCategory ? { category: filteredCategory } : {}; // Use correct field name
    const products = await Product.find(query).sort({ name: 1 }).exec(); // Sort by 'name', adjust if needed

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
        'Access-Control-Allow-Origin': '*',
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Error fetching products' }),
    };
  }
};