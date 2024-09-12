const mongoose = require('mongoose');
const connectToDB = require('./connectToDB');
const SiteSettings = require('../models/SiteSettings');

exports.handler = async function (event, context) {
    // CORS Preflight Check
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({}),
        };
    }

    // Connect to the database
    try {
        await connectToDB();
    } catch (dbError) {
        console.error('Database connection error:', dbError);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ error: 'Failed to connect to the database', details: dbError.message }),
        };
    }

    // Handle GET request: Fetch site settings
    if (event.httpMethod === 'GET') {
        try {
            const siteSettings = await SiteSettings.findOne({}).exec();
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(siteSettings),
            };
        } catch (error) {
            console.error('Error fetching site settings:', error);
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({ error: 'Error fetching site settings', details: error.message }),
            };
        }
    }

    // Handle PUT request: Update site settings
    if (event.httpMethod === 'PUT') {
        try {
            const parsedBody = JSON.parse(event.body);

            // Verify the parsedBody structure
            console.log('Parsed Body:', parsedBody);

            const updatedSettings = await SiteSettings.findOneAndUpdate({}, parsedBody, {
                new: true,
                upsert: true,
            }).exec();

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify(updatedSettings),
            };
        } catch (error) {
            console.error('Error updating site settings:', error);
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                body: JSON.stringify({ error: 'Error updating site settings', details: error.message }),
            };
        }
    }

    // Method Not Allowed
    return {
        statusCode: 405,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
};