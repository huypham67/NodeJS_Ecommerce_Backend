'use strict'

const { search } = require("../../routes/product");
const { product } = require("../product.model");


const findAllDraftProductsByShop = async ({ query, limit, skip }) => {
    return await queryProductByShop({ query, limit, skip });
}

const findAllPublishedProductsByShop = async ({ query, limit, skip }) => {
    return await queryProductByShop({ query, limit, skip });
}

const searchProducts = async ({ keyword }) => {
    const regex = new RegExp(keyword, 'i');

    const results = await product.find(
        {
            isPublished: true,
            $text: { $search: regex }
        }, // chỉ dùng string
        { score: { $meta: 'textScore' } }
    )
        .sort({ score: { $meta: 'textScore' } }) // sắp xếp theo độ khớp
        .lean();
    return results;
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const { modifiedCount } = await product.updateOne(
        { _id: product_id, product_shop },
        { $set: { isDraft: false, isPublished: true } }
    );

    return modifiedCount; // 0 hoặc 1
};
const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const { modifiedCount } = await product.updateOne(
        { _id: product_id, product_shop },
        { $set: { isDraft: true, isPublished: false } }
    );

    return modifiedCount; // 0 hoặc 1
};

const queryProductByShop = async ({ query, limit = 50, skip = 0 }) => {
    return await product.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ updatedAt: -1 })
        .populate('product_shop', 'name email -_id')
        .lean()
        .exec();
}


module.exports = {
    findAllDraftProductsByShop,
    findAllPublishedProductsByShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProducts
}
