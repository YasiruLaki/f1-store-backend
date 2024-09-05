const connectToDB = require('./connectToDB');
const Product = require('../models/Product'); // Ensure this is the correct model

exports.handler = async (event) => {
    // Handle CORS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({}),
        };
    }

    // Handle method not allowed
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    // Connect to the database
    try {
        await connectToDB();
    } catch (dbError) {
        console.error('Database connection error:', dbError);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database connection error', details: dbError.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    // Parse JSON request body
    let parsedBody;
    try {
        parsedBody = JSON.parse(event.body);
    } catch (parseError) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    const { name, shortName, price, category, description, tags, images } = parsedBody;

    // Ensure `tags` is parsed correctly if it's a string
    const parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags || '[]');

    // Validate required fields
    if (!name || !shortName || !price || !category || !description) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    try {
        // Create and save a new product document
        const newProduct = new Product({
            name,
            shortName,
            price,
            category,
            description,
            tags: parsedTags, // Use the parsed tags
            images, // Include image URLs
        });
        await newProduct.save();

        return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'Product saved successfully!' }),
          };
        } catch (error) {
          console.error('Error:', error);
          return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'Internal Server Error' }),
          };
    }
};