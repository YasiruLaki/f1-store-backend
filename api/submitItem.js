const connectToDB = require('./connectToDB');
const Product = require('../models/Product');
const axios = require('axios'); // For API requests

const PRINTFUL_API_KEY = 'YmYNiucXWDWbtqYMpWMaN6Fp3VwfEVwRFXxeTTlx';
const PRINTFUL_BASE_URL = 'https://api.printful.com/products';

async function syncWithPrintful(productData, method = 'POST', productID = null) {
    const url = productID ? `${PRINTFUL_BASE_URL}/${productID}` : PRINTFUL_BASE_URL;
    const options = {
        method: method,
        url: url,
        headers: {
            Authorization: `Bearer ${PRINTFUL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        data: productData,
    };

    try {
        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.error('Error syncing with Printful:', error.response?.data || error.message);
        throw new Error('Failed to sync with Printful');
    }
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, PUT, GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({}),
        };
    }

    let parsedBody;
    try {
        parsedBody = JSON.parse(event.body);
    } catch (parseError) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    }

    const { productID, name, shortName, price, salePrice, category, sizes, description, tags, images } = parsedBody;

    if (!productID || !name || !shortName || !price || !category) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields' }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    }

    try {
        await connectToDB();
        console.log('Database connected successfully');
        const productData = { name, shortName, price, salePrice, category, sizes, description, tags, images };

        if (event.httpMethod === 'POST') {
            const newProduct = new Product({
                productID,
                name,
                shortName,
                price,
                category,
                sizes,
                description,
                tags,
                images,
                createdAt: new Date(),
                orders: 0,
                rating: 0,
                salePrice: 0,
            });
            await newProduct.save();
            
            await syncWithPrintful(productData, 'POST'); // Sync new product to Printful

            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Product created successfully', product: newProduct }),
                headers: { 'Access-Control-Allow-Origin': '*' },
            };
        } else if (event.httpMethod === 'PUT') {
            const existingProduct = await Product.findOneAndUpdate(
                { productID: productID },
                productData,
                { new: true }
            );

            if (!existingProduct) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Product not found' }),
                    headers: { 'Access-Control-Allow-Origin': '*' },
                };
            }

            await syncWithPrintful(productData, 'PUT', productID); // Update product on Printful

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Product updated successfully', product: existingProduct }),
                headers: { 'Access-Control-Allow-Origin': '*' },
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
                headers: { 'Access-Control-Allow-Origin': '*' },
            };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    }
};