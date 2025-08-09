'use strict'

const { set } = require('lodash');
const { model, Schema } = require('mongoose');
const { default: slugify } = require('slugify');

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'products'

const productSchema = new Schema({
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronic', 'Clothing', 'Furniture']
    },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    product_ratingsAverage: { 
        type: Number, 
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // round to one decimal place
    },
    product_variations: {type: Array, default: []}, // variations like size, color, etc.
    isDraft: { type: Boolean, default: true, index: true, select: false }, // draft product
    isPublished: { type: Boolean, default: false, index: true, select: false }, // published product

    // more
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

// create index for searching by product
productSchema.index({ product_name: 'text', product_description: 'text' });


// Document middleware to set slug before saving
productSchema.pre('save', function(next) {
    if (!this.product_slug) {
        this.product_slug = slugify(this.product_name, { lower: true, strict: true });
    }
    next();
});

// define the product type = clothing

const clothingSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' } // reference to the shop
}, {
    collection: 'clothing',
    timestamps: true
});

// define the product type = electronics

const electronicSchema = new Schema({
    manufacturer: { type: String, required: true },
    model: String,
    color: { type: Schema.Types.Mixed, required: true },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' } // reference to the shop
}, {
    collection: 'electronic',
    timestamps: true
});

const furnitureSchema = new Schema({
    material: { type: String, required: true },
    dimensions: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' } // reference to the shop
}, {
    collection: 'furniture',
    timestamps: true
});

module.exports = {
    product: model(DOCUMENT_NAME, productSchema, COLLECTION_NAME),
    clothing: model('Clothing', clothingSchema, 'clothing'),
    electronic: model('Electronic', electronicSchema, 'electronic'),
    furniture: model('Furniture', furnitureSchema, 'furniture')
}