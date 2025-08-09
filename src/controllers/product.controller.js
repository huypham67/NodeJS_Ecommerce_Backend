'use strict'

const { SuccessResponse } = require("../core/success.response");

const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {

    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create product successfully',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId // req.user.shopId is set by authentication middleware
            })
        }).send(res);
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product successfully',
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unpublish product successfully',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res);
    }

    // QUERY
    /**\
     * @desc Find all draft products
     * @param {Object} req - The request object containing user information
     * @param {Object} res - The response object to send the result
     * @return {Promise<void>} - A promise that resolves when the response is sent
     * @throws {BadRequestError} - If the product shop is not provided or if
     */
    findAllDraftProductsByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find all draft products successfully',
            metadata: await ProductServiceV2.findAllDraftProductsByShop({
                product_shop: req.user.userId,
            })
        }).send(res);
    }

    findAllPublishedProductsByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Find all published products successfully',
            metadata: await ProductServiceV2.findAllPublishedProductsByShop({
                product_shop: req.user.userId,
            })
        }).send(res);
    }

    searchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Search products successfully',
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res);
    }
}

module.exports = new ProductController();