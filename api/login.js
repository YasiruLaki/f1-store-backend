const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const headers = {
  'Access-Control-Allow-Origin': '*', // Replace * with your frontend URL in production
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === 'POST') {
    console.log('Handling POST request');
    try {
      const { email, password } = JSON.parse(event.body);
      console.log('Received email:', email);
      console.log('Received password:', password);

      if (!email || !password) {
        console.log('Error: Email or password missing');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and password are required' }),
        };
      }

      await client.connect();
      const database = client.db('admin-login');
      const users = database.collection('users');

      const user = await users.findOne({ email });
      console.log('User found:', user);

      if (!user) {
        console.log('Error: User not found');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }

      const storedHash = user.password.replace(/^\$2y\$/, '$2a$');
      const isPasswordCorrect = bcrypt.compareSync(password, storedHash);
      console.log('Password comparison result:', isPasswordCorrect);

      if (!isPasswordCorrect) {
        console.log('Error: Invalid password');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid email or password' }),
        };
      }

      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Token generated:', token);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Login successful', token }),
      };
    } catch (error) {
      console.error('Error processing POST request:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      };
    } finally {
      await client.close();
    }
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'GET request received' }),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};