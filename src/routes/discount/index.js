'use strict'

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

//get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
//get all discounts
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodesWithProducts));

//authentication
router.use(authenticationV2);

//create a discount code
router.post('', asyncHandler(discountController.createDiscountCode));
router.get('', asyncHandler(discountController.getAllDiscountCodes));

module.exports = router;