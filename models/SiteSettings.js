const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteAnnouncement: {
        type: String,
        required: true
    },
    bestSellingProducts: {
        product1: {
            type: String,
            required: true
        },
        product2: {
            type: String,
            required: true
        },
        product3: {
            type: String,
            required: true
        }
    },
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;