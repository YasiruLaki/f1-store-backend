const mongoose = require('mongoose');
const connectToDB = require('./connectToDB');
const SiteSettings = require('../models/SiteSettings');

// Cache database connection between invocations
let isDBConnected = false;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function for standard responses
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
});

exports.handler = async function (event) {
    // CORS Preflight Check
    if (event.httpMethod === 'OPTIONS') {
        return createResponse(200, {});
    }

    // Connect to the database if not already connected
    if (!isDBConnected) {
        try {
            await connectToDB();
            isDBConnected = true;
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return createResponse(500, { error: 'Failed to connect to the database', details: dbError.message });
        }
    }

    // Handle GET request: Fetch site settings
    if (event.httpMethod === 'GET') {
        try {
            const siteSettings = await SiteSettings.findOne({}).lean().exec();
            return createResponse(200, siteSettings);
        } catch (error) {
            console.error('Error fetching site settings:', error);
            return createResponse(500, { error: 'Error fetching site settings', details: error.message });
        }
    }

    // Handle PUT request: Update site settings
    if (event.httpMethod === 'PUT') {
        try {
            const parsedBody = JSON.parse(event.body);
            console.log('Parsed Body:', parsedBody);

            const updatedSettings = await SiteSettings.findOneAndUpdate({}, parsedBody, {
                new: true,
                upsert: true,
                lean: true, // Return a plain object
            }).exec();

            return createResponse(200, updatedSettings);
        } catch (error) {
            console.error('Error updating site settings:', error);
            return createResponse(500, { error: 'Error updating site settings', details: error.message });
        }
    }

    // Method Not Allowed
    return createResponse(405, { error: 'Method Not Allowed' });
};