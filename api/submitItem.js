const connectToDB = require('./connectToDB');
const Product = require('../models/Product'); // Ensure this is the correct model

exports.handler = async (event) => {
    // Handle CORS preflight request
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

    const { productID, name, shortName, price, category, description, tags, images } = parsedBody;

    if (!productID || !name || !shortName || !price || !category) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    try {
        if (event.httpMethod === 'POST') {
            // Creating a new product
            const newProduct = new Product({ productID, name, shortName, price, category, description, tags, images, createdAt: new Date(), orders: 0, rating: 0, salePrice: 0 });
            await newProduct.save();
            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Product created successfully', product: newProduct }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        } else if (event.httpMethod === 'PUT') {
            // Updating an existing product
            const existingProduct = await Product.findOneAndUpdate(
                { productID: productID },
                { name, shortName, price, category, description, tags, images },
                { new: true }
            );

            if (!existingProduct) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Product not found' }),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Product updated successfully', product: existingProduct }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }
};