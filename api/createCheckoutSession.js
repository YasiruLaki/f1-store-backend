const stripe = require('stripe')('sk_test_7sJw8Rr7h7ErIenVO4OIqtuk00RY7zLaBq');
const connectToDB = require('./connectToDB');

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

    // Validate and log cart items
    const lineItems = cart.map(item => {
        const unitAmount = Math.round((item.salePrice > 0 ? item.salePrice : item.price) * 100); // Convert to cents
        return {
            price_data: {
                currency: 'usd', // Change to your currency
                product_data: {
                    name: `${item.name} (Size: ${item.size})`, // Include size in the product name
                    images: [item.images[0]], // Adjust as needed
                },
                unit_amount: unitAmount, // Convert to cents
            },
            quantity: item.quantity,
        };
    });

    // Shipping options (replace with your shipping rate IDs)
    const shippingOptions = [
        {
            shipping_rate: 'shr_1Pxc34FV9O4qdsrk6QhGPbmZ' 
        }
    ];

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            shipping_options: shippingOptions,
            billing_address_collection: 'required', 
            discounts: [],
            allow_promotion_codes: true, 
            success_url: 'http://localhost:8888/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:8888/cancel',
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