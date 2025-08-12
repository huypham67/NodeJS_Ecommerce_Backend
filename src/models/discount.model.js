'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts';

const discountSchema = new Schema({
    discount_name: { type: String, required: true }, // Tên chương trình
    discount_description: { type: String, required: true }, // Mô tả
    discount_type: { type: String, default: 'fixed_amount', enum: ['fixed_amount', 'percentage'] }, // Loại: giảm tiền cố định hay theo %
    discount_value: { type: Number, required: true }, // Giá trị giảm (10.000 VNĐ hoặc 10%)
    discount_code: { type: String, required: true }, // Mã giảm giá
    discount_start_date: { type: Date, required: true }, // Ngày bắt đầu
    discount_end_date: { type: Date, required: true }, // Ngày kết thúc
    discount_max_uses: { type: Number, required: true }, // Số lượng voucher tối đa
    discount_uses_count: { type: Number, default: 0 }, // Số voucher đã được sử dụng
    discount_users_used: { type: Array, default: [] }, // Danh sách user đã sử dụng
    discount_max_uses_per_user: { type: Number, required: true }, // Số lần tối đa mỗi user được dùng
    discount_min_order_value: { type: Number, required: true }, // Giá trị đơn hàng tối thiểu
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop' }, // Shop sở hữu voucher

    discount_is_active: { type: Boolean, default: true }, // Voucher có hoạt động không
    discount_applies_to: { type: String, required: true, enum: ['all', 'specific'] }, // Áp dụng cho: all hay specific products
    discount_product_ids: { type: Array, default: [] } // Danh sách sản phẩm được áp dụng (nếu applies_to = 'specific')
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

module.exports = model(DOCUMENT_NAME, discountSchema);