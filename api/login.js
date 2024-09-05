const { MongoClient } = require('mongodb');


const uri = process.env.MONGODB_URI; // Use environment variables for sensitive info
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    try {
      await client.connect();
      const database = client.db('admin-login');
      const users = database.collection('users');

      // Placeholder: Add logic to handle login
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Login function will be implemented here' })
      };
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      };
    } finally {
      await client.close();
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};