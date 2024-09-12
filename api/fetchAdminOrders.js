const mongoose = require('mongoose');
const connectToDB = require('./connectToDB');
const Order = require('../models/Order');

exports.handler = async function (event, context) {
    try {
        connectToDB();

        const { status } = event.queryStringParameters;

        if (!status) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({ message: 'Status is required' }),
            };
        }

        if (status === 'all') {
            const orders = await Order.find({}).sort({ createdAt: -1 }).exec();
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(orders),
            };
        }
        else {
            const orders = await Order.find({ status }).sort({ createdAt: -1 }).exec();
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(orders),
            };
        }
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'Error fetching orders' }),
        };
    }
}