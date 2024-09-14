const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const connectToDB = require('./connectToDB');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({}),
        };
    }

    try {
        await connectToDB();
    } catch (dbError) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database connection error', details: dbError.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    let parsedBody;
    try {
        parsedBody = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    const { cart } = parsedBody;

    if (!cart || cart.length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Cart is empty' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    // Validate and prepare line items
    const lineItems = cart.map(item => {
        const unitAmount = Math.round((item.salePrice > 0 ? item.salePrice : item.price) * 100); // Convert to cents
        return {
            price_data: {
                currency: 'usd', // Change to your currency
                product_data: {
                    name: item.size && item.size.trim() !== '' ? `${item.name} (Size: ${item.size})` : item.name,
                    images: [item.images[0]], // Adjust as needed
                    metadata: {
                        productID: item.productID,
                        size: item.size,
                    },
                },
                unit_amount: unitAmount, // Convert to cents
            },
            quantity: item.quantity,
        };
    });

    // Shipping options (replace with your shipping rate IDs)
    const shippingOptions = [
        {
            shipping_rate: 'shr_1Pxc34FV9O4qdsrk6QhGPbmZ' // Adjust as needed
        }
    ];

    try {
        const uuid = uuidv4();
        const numericPart = parseInt(uuid.replace(/-/g, '').substr(0, 5), 16);
        const orderID = `#${numericPart.toString().padStart(5, '0')}`;
        const encodedOrderID = encodeURIComponent(orderID);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            metadata: {
                orderID,
                productIDs: cart.map(item => item.productID).join(','),
                sizes: cart.map(item => item.size).join(','),
                images: cart.map(item => item.images[0]).join(','),
            }, 
            mode: 'payment',
            shipping_options: shippingOptions,
            billing_address_collection: 'required', 
            phone_number_collection: {
                enabled: true,
              },
            discounts: [], // Add any discount data if needed
            allow_promotion_codes: true, 
            success_url: `https://f1-madness-store.netlify.app/order-success?session_id={CHECKOUT_SESSION_ID}&orderID=${encodedOrderID}`, // Replace with your success URL
            cancel_url: 'https://f1-madness-store.netlify.app/cancel', // Replace with your cancel URL
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ sessionId: session.id }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create checkout session' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }
};