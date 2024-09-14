const mongoose = require('mongoose');
const connectToDB = require('./connectToDB'); // Function to connect to the database
const Product = require('../models/Product');
const Session = require('../models/Session'); // Import the Session model

exports.handler = async function (event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle CORS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({})
        };
    }

    try {
        const body = JSON.parse(event.body);
        const productIDs = body.productIDs;
        const productQuantities = body.productQuantities;
        const sessionID = event.queryStringParameters.session_id;

        console.log(`Session ID: ${sessionID}`);

        // Validate input data
        if (!productIDs || !Array.isArray(productIDs) || !Array.isArray(productQuantities) || productIDs.length !== productQuantities.length) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid product data: productIDs and productQuantities must be arrays of the same length' })
            };
        }

        if (!sessionID) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Session ID is required' })
            };
        }

        // Connect to the database
        await connectToDB();

        // Check if the session ID has already been used
        const session = await Session.findOne({ sessionID });
        if (session) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Order count already updated for this session' })
            };
        }

        // Process and update product orders concurrently
        const updatePromises = productIDs.map(async (productID, i) => {
            const quantity = productQuantities[i];
            return Product.updateOne(
                { productID },
                { $inc: { orders: quantity } } // Increment only the orders field
            );

        });
        // Await all product updates to complete
        await Promise.all(updatePromises);

        // Record the session ID to prevent future updates
        await new Session({ sessionID }).save();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Order counts updated successfully' })
        };

    } catch (error) {
        console.error('Error updating order count for session:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error updating order count' })
        };
    }
};