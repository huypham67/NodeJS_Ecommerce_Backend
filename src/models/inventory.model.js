'use strict';

// key !mdbg install by Mongo Snippets for Node-js

const { model, Schema, Types } = require('mongoose'); // Erase if already required 516K (gzipped: 124.1K)

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'Inventories';

// Declare the Schema of the Mongo model
const inventorySchema = new Schema({
    // ID của sản phẩm mà record tồn kho này thuộc về
    inventory_productId: { type: Schema.Types.ObjectId, ref: 'Product' },

    // Vị trí kho (ví dụ: 'HCM-Q1', 'HN-CauGiay')
    inventory_location: { type: String, default: 'unKnown' },

    // Số lượng hàng thực tế trong kho
    inventory_stock: { type: Number, required: true },

    // ID của shop sở hữu kho hàng này
    inventory_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },

    // "Đặt gạch": danh sách các đơn hàng đang giữ sản phẩm
    inventory_reservations: { type: Array, default: [] }
    /*
        cartId, stock, createdAt  
    */
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema, COLLECTION_NAME),
}