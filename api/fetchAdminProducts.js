const mongoose = require('mongoose');
const connectToDB = require('./connectToDB'); // Adjust the path if needed
const Product = require('../models/Product'); // Import the Product model

// Cache the database connection status
let isConnected = false;

const headers = {
  'Access-Control-Allow-Origin': '*', // Replace * with your frontend URL in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function for standard responses
const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.handler = async function (event) {
  try {
    // Reuse existing database connection if already connected
    if (!isConnected) {
      await connectToDB();
      isConnected = true;
    }

    // Get category from query parameters
    const { filteredCategory } = event.queryStringParameters || {};

    // Build query for products
    const query = filteredCategory ? { category: filteredCategory } : {};

    // Fetch and sort products using lean query
    const products = await Product.find(query).sort({ name: 1 }).lean().exec();

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    }, {});

    return createResponse(200, groupedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return createResponse(500, { message: 'Error fetching products' });
  }
};