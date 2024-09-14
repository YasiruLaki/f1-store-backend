const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const connectToDB = require('./connectToDB');
const Order = require('../models/Order');

exports.handler = async function(event) {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        // Preflight request
        return {
            statusCode: 204,
            headers,
            body: JSON.stringify({})
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    const sessionId = event.queryStringParameters.session_id;
    const orderID = event.queryStringParameters.orderID;

    if (!sessionId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Session ID is required' })
        };
    }

    if (!orderID) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Order ID is required' })
        };
    }

    try {
        await connectToDB();

        const order = await Order.findOne({ orderID });
        if (!order) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Order not found' })
            };
        }

        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
        } catch (stripeError) {
            console.error('Error retrieving Stripe session:', stripeError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Error retrieving Stripe session' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                id: session.id,
                created: session.created,
                payment_method_types: session.payment_method_types,
                customer_details: session.customer_details,
                receipt_url: order.receiptUrl,
                items: order.items,
            }),
        };
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};