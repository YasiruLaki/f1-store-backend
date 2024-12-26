const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productID: { type: String, required: true, unique: true, index: true },
  stripeProductId: { type: String, required: false },
  stripePriceId: { type: String, required: false },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  sizes: [
    {
      name: { type: String, required: true },
      printfulId: { type: String, required: true },
    },
  ],
  description: { type: String, required: true },
  tags: [String],
  images: [String],
  createdAt: { type: Date, default: Date.now },
  orders: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
});

// Check if the model is already defined to avoid the OverwriteModelError
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;