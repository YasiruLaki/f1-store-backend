const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const connectToDB = require('./connectToDB');
const Order = require('../models/Order');

// Use the Stripe Webhook Secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

    let eventBody;
    try {
        eventBody = JSON.parse(event.body);
    } catch (error) {
        console.error('Failed to parse webhook event:', error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request payload' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    // Verify webhook signature
    const sig = event.headers['stripe-signature'];
    let stripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Webhook signature verification failed' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }

    // Handle checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;

        const productIDs = session.metadata.productIDs ? session.metadata.productIDs.split(',') : [];
        const sizes = session.metadata.sizes ? session.metadata.sizes.split(',') : [];
        const images = session.metadata.images ? session.metadata.images.split(',') : [];

        // Debugging log to check session object
        console.log('Stripe session data:', JSON.stringify(session));

        try {
            await connectToDB();
        } catch (dbError) {
            console.error('Database connection error:', dbError.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Database connection error' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        }

        // Retrieve the cart from the session metadata
        let lineItems;
        try {
            const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id);
            lineItems = lineItemsResponse.data;
        } catch (error) {
            console.error('Failed to fetch line items:', error.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch line items' }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        }

        // Create the order object from the session
        const order = {
            orderID: session.metadata.orderID || 'Unknown OrderID',
            customer: {
                name: session.customer_details?.name,
                email: session.customer_details?.email,
                address: session.customer_details?.address
                    ? `${session.customer_details.address.line1}, ${session.customer_details.address.city}, ${session.customer_details.address.country}`
                    : 'N/A',
                phoneNumber: session.customer_details?.phone,
            },
            items: lineItems.map((item, index) => ({
                productID: productIDs[index] || 'Unknown ProductID', // Match product ID using index
                image: images[index] || ' ', // Match image using index
                name: item.description || 'Unknown Product', // Line item description
                size: sizes[index] || 'N/A', // Match size using index
                price: (item.amount_total || 0) / 100, // Convert amount to dollars
                quantity: item.quantity || 1,
            })),
            subTotal: session.amount_subtotal / 100,
            discount: session.total_details.amount_discount / 100,
            shipping: session.total_details.amount_shipping / 100,
            totalAmount: session.amount_total / 100,
            paymentIntentId: session.payment_intent || 'Unknown Payment Intent',
            status: 'completed',
            createdAt: new Date(),
        };

        try {
            const savedOrder = await Order.create(order);
            console.log('Order saved successfully:', savedOrder); // Log success
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        } catch (error) {
            console.error('Failed to save order:', error.message);
            console.error('Order data:', JSON.stringify(order)); // Log the order data for debugging
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to save order', details: error.message }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            };
        }
    }

    // Handle charge.updated event
    if (stripeEvent.type === 'charge.updated') {
        const charge = stripeEvent.data.object;

        if (charge.receipt_url) {
            try {
                await connectToDB();
                const order = await Order.findOne({ paymentIntentId: charge.payment_intent });

                if (order) {
                    order.receiptUrl = charge.receipt_url;
                    await order.save();
                    console.log('Receipt URL updated successfully:', order);
                } else {
                    console.warn('Order not found for payment intent:', charge.payment_intent);
                }
            } catch (dbError) {
                console.error('Database connection error:', dbError.message);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Database connection error' }),
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                };
            }
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ received: true }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
};