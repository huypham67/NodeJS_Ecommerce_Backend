'use strict'

const { min } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectIdMongoDb } = require("../utils");
const { product } = require("../models/product.model");
const { findAllProducts } = require("../models/repositories/product.repo");
const { findAllDiscountCodesUnSelect, checkDiscountExists } = require("../models/repositories/discount.repo");

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
        return discounts;
    }

    /*
        Get discount amount by code
        products = [
            {
                productId,
                shopId,
                quantity, 
                name,
                price
            }
        ]   
    */
    static async getDiscountAmountByCode({
        codeId, userId, shopId, products
    }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId),
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found');
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_users_used,
            discount_type,
            discount_value,
            discount_start_date,
            discount_end_date,
            discount_max_uses_per_user
        } = foundDiscount;

        if (!discount_is_active) {
            throw new BadRequestError('Discount code is not active');
        }

        if (discount_max_uses <= 0) {
            throw new BadRequestError('Discount code has reached its maximum usage limit');
        }

        // kiểm tra
        const now = new Date();
        const start = new Date(discount_start_date);
        const end = new Date(discount_end_date);

        if (now < start || now > end) {
            throw new BadRequestError('Discount code is not valid at this time');
        }

        // check xem cost có đủ điều kiện để áp dụng discount hay không
        let totalCost = 0;
        if (discount_min_order_value > 0) {
            totalCost = products.reduce((total, product) => {
                return total + (product.price * product.quantity);
            }, 0);

            if (totalCost < discount_min_order_value) {
                throw new BadRequestError(`Total order value must be at least ${discount_min_order_value}`);
            }
        }

        if (discount_max_uses_per_user > 0) {
            const userUsedCount = discount_users_used.filter(user => user.toString() === userId.toString()).length;

            if (userUsedCount >= discount_max_uses_per_user) {
                throw new BadRequestError('You have reached the maximum usage limit for this discount code');
            }
        }

        // check xem discount này là fixed hay percentage
        const amount = discount_type === 'fixed_amount' ? discount_value : totalCost * (discount_value / 100);

        return {
            totalCost,
            discountAmount: amount,
            totalAfterDiscount: totalCost - amount,
        }

    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discountModel.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        });
        return deleted;
    }

    static async cancelDiscountCode({ shopId, codeId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId)
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found');
        }

        const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        });
        return result;
    }
}

module.exports = DiscountService;