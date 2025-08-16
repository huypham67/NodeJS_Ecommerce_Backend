'use strict'

const { SuccessResponse } = require("../core/success.response")
const DiscountService = require("../services/discount.service")

class DiscountController {
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create discount code successfully',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all discount codes successfully',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount successfully',
            metadata: await DiscountService.getDiscountAmountByCode({
                ...req.body
            })
        }).send(res);
    }

    getAllDiscountCodesWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all discount codes with products successfully',
            metadata: await DiscountService.getAllDiscountCodesWithProducts({
                ...req.query,
                //shopId: req.user.userId
            })
        }).send(res);
    }


}

module.exports = new DiscountController();