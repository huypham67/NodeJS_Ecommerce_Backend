'use strict'

const express = require('express');
const productController = require('../../controllers/product.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

// search products
router.get('/search/:keyword', asyncHandler(productController.searchProducts));
// find all products
router.get('/', asyncHandler(productController.findAllProducts));
// find product by id
router.get('/:id', asyncHandler(productController.findProductById));


//authentication
router.use(authenticationV2);
//////////////////
router.post('', asyncHandler(productController.createProduct));
router.patch('/:id', asyncHandler(productController.updateProduct));
router.post('/:id/publish', asyncHandler(productController.publishProductByShop));
router.post('/:id/unpublish', asyncHandler(productController.unPublishProductByShop));

// QUERY
router.get('/drafts/all', asyncHandler(productController.findAllDraftProductsByShop));
router.get('/published/all', asyncHandler(productController.findAllPublishedProductsByShop));

module.exports = router;