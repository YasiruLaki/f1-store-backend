const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        email: String,
        address: String,
    },
    items: [
        {
            productID: String,
            name: String,
            size: String,
            price: Number,
            quantity: Number,
        },
    ],
    totalAmount: Number,
    paymentIntentId: String,
    status: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);