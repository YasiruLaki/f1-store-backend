const mongoose = require('mongoose');
const connectToDB = require('./connectToDB');
const Order = require('../models/Order');

exports.handler = async function(event) {

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: JSON.stringify({})
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid request' })
        };
    }

    const { orderID, status } = data;

    if (!orderID) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Order ID is required' })
        };
    }

    if (!status) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Status is required' })
        };
    }

    try {
        await connectToDB();
        console.log('DB Connected');
        
        const order = await Order.findOne({ orderID });
        if (!order) {
            console.log('Order not found');
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Order not found' })
            };
        }
    
        order.status = status;
        await order.save();
        console.log('Order updated:', order);
    
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(order)
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error updating order status' })
        };
    }
}