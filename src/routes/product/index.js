'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// search products
router.get('/search/:keyword', asyncHandler(productController.searchProducts));
//authentication
router.use(authenticationV2);
//////////////////
// logout
router.post('', asyncHandler(productController.createProduct));
// publish product
router.post('/:id/publish', asyncHandler(productController.publishProductByShop));
// unpublish product
router.post('/:id/unpublish', asyncHandler(productController.unPublishProductByShop));
// QUERY
router.get('/drafts', asyncHandler(productController.findAllDraftProductsByShop));
router.get('/published', asyncHandler(productController.findAllPublishedProductsByShop));

module.exports = router;