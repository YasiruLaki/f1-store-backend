const mongoose = require('mongoose');
const connectToDB = require('./connectToDB'); 
const Product = require('../models/Product'); 


let isConnected = false;

const headers = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.handler = async function (event) {
  try {
    if (!isConnected) {
      await connectToDB();
      isConnected = true;
    }

    const { filteredCategory } = event.queryStringParameters || {};

    const query = filteredCategory ? { category: filteredCategory } : {};
    const products = await Product.find(query).sort({ name: 1 }).lean().exec();

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