'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model');

const { BadRequestError } = require('../core/error.response');
const { findAllDraftProductsByShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllPublishedProductsByShop,
    searchProducts,
    findAllProducts,
    findProductById,
    updateProductById
} = require('../models/repositories/product.repo');
const { removeUndefinedFields, updateNestedObjectParser } = require('../utils');
const { update } = require('lodash');
const { insertInventory } = require('../models/repositories/inventory.repo');

// define Factory class to create product

class ProductFactory {
    /*
        type: 'Clothing',
        payload
    */
    static productRegistry = {} //key-class
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}. Supported types are Clothing, Electronic, and Furniture.`);
        }
        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, product_id, bodyUpdate) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}. Supported types are Clothing, Electronic, and Furniture.`);
        }
        return new productClass(bodyUpdate).updateProduct(product_id);
    }

    // PUT
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }
    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }
    // END PUT

    //query
    static async findAllDraftProductsByShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { isDraft: true };
        if (product_shop) {
            query.product_shop = product_shop;
        }
        return await findAllDraftProductsByShop({ query, limit, skip });
    }

    static async findAllPublishedProductsByShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { isPublished: true };
        if (product_shop) {
            query.product_shop = product_shop;
        }
        return await findAllPublishedProductsByShop({ query, limit, skip });
    }

    static async searchProducts({ keyword }) {
        return await searchProducts({ keyword });
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
        return await findAllProducts({
            limit, sort, page, filter,
            select: ['product_name', 'product_price', 'product_thumb']
        });
    }

    static async findProductById({ product_id }) {
        return await findProductById({ product_id, unselect: ['__v'] });
    }
}

// define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price,
        product_quantity, product_type, product_shop, product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    // create new product
    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id });
        if (newProduct) {
            // add product_stock to inventory
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }
        return newProduct;
    }

    // update product
    async updateProduct(product_id, bodyUpdate) {
        return await updateProductById({ product_id, bodyUpdate, model: product });
    }
}

// Define sub-class for different product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop // reference to the shop
        });
        if (!newClothing) throw new BadRequestError('Failed to create clothing product');

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('Failed to create product');

        return newProduct;
    }

    async updateProduct(product_id) {
        /*
            a: undefined,
            b: null
        */
        //1. remove undefined and null values
        console.log('(1):: ', this);
        const objectParams = removeUndefinedFields(this);
        console.log('(2):: ', this);
        //2. check xem update ở chỗ nào
        if (objectParams.product_attributes) {
            //update child
            await updateProductById({
                product_id,
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
                model: clothing
            });
        }

        const updatedProduct = await super.updateProduct(product_id, updateNestedObjectParser(objectParams));
        return updatedProduct;
    }
}

// Define sub-class for different product types electronic
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop // reference to the shop
        });
        if (!newElectronic) throw new BadRequestError('Failed to create electronic product');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('Failed to create product');

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop // reference to the shop
        });
        if (!newFurniture) throw new BadRequestError('Failed to create furniture product');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Failed to create product');

        return newProduct;
    }
}

// Register product types
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Electronic', Electronic);
ProductFactory.registerProductType('Furniture', Furniture);

module.exports = ProductFactory;