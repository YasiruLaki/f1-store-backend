const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let isConnected = false; // Track database connection status

const headers = {
  'Access-Control-Allow-Origin': '*', // Replace * with your frontend URL in production
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function for standard responses
const createResponse = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  console.log('Received event:', event.httpMethod);

  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, '');
  }

  if (event.httpMethod === 'POST') {
    console.log('Handling POST request');
    try {
      const { email, password } = JSON.parse(event.body);

      if (!email || !password) {
        return createResponse(400, { error: 'Email and password are required' });
      }

      // Connect to the database if not connected
      if (!isConnected) {
        await client.connect();
        isConnected = true;
      }

      const database = client.db('admin-login');
      const users = database.collection('users');

      const user = await users.findOne({ email });

      if (!user) {
        return createResponse(401, { error: 'Invalid email or password' });
      }

      const storedHash = user.password.replace(/^\$2y\$/, '$2a$');
      const isPasswordCorrect = bcrypt.compareSync(password, storedHash);

      if (!isPasswordCorrect) {
        return createResponse(401, { error: 'Invalid email or password' });
      }

      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return createResponse(200, { message: 'Login successful', token });
    } catch (error) {
      console.error('Error processing POST request:', error);
      return createResponse(500, { error: 'Internal Server Error' });
    }
  }

  if (event.httpMethod === 'GET') {
    return createResponse(200, { message: 'GET request received' });
  }

  return createResponse(405, { error: 'Method not allowed' });
};