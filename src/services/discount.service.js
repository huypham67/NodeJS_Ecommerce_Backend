'use strict'

const { min } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectIdMongoDb } = require("../utils");
const { product } = require("../models/product.model");
const { findAllProducts } = require("../models/repositories/product.repo");
const { findAllDiscountCodesUnSelect } = require("../models/repositories/discount.repo");

/*
    Discount Service
    1 - Generate a discount code (Shop | Admin)
    2 - Get discount amount (User)
    3 - Get all discount codes (User | Shop)
    4 - Verify discount code (User)
    5 - Delete a discount code (Shop | Admin)
    6 - Cancel a discount code (User)
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user, users_used
        } = payload;

        // kiểm tra
        const now = new Date();
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (now < start || now > end) {
            throw new BadRequestError('Invalid discount date range');
        }

        if (start >= end) {
            throw new BadRequestError('Start date must be before end date');
        }

        // create index for discount code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean();

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount code already exists and is active');
        }

        const newDiscount = await discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: start,
            discount_end_date: end,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count || 0,
            discount_users_used: users_used || [],
            discount_shopId: convertToObjectIdMongoDb(shopId),
            discount_max_uses_per_user: max_uses_per_user || 1,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids.map(id => convertToObjectIdMongoDb(id))
        });

        return newDiscount;
    }

    static async updateDiscountCode() {

    }

    /*
        Get all discount codes available with products
    */
    static async getAllDiscountCodesWithProducts({
        code, shopId, userId, limit, page
    }) {
        // create index for discount code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount code not found or inactive');
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === 'all') {
            //get all products
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongoDb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }


        if (discount_applies_to === 'specific') {
            // get specific products
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            });
        }

        return products;
    }

    /*
        Get all discount codes of a shop
    */
    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId', 'discount_is_active'],
            model: discountModel
        });
    }
}