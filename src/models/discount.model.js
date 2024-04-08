"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
const discountSchema = new Schema(
    {
        discount_name: {
            type: String,
            required: true,
        },
        discount_description: {
            type: String,
            required: true,
        },
        discount_type: {
            //theo tiền là fixed_amount, theo % là percentage
            type: String,
            emun: ["fixed_amount", "percentage"],
            default: "fixed_amount",
        },
        discount_value: {
            //10.000vnd || 10%
            type: Number,
            required: true,
        },
        discount_code: {
            //discountCode
            type: String,
            required: true,
        },
        discount_start_date: {
            //ngày bắt đầu
            type: Date,
            required: true,
        },
        discount_end_date: {
            //ngày kết thúc
            type: Date,
            required: true,
        },
        discount_max_uses: {
            //số lượng discount được áp dụng
            type: Number,
            required: true,
        },
        discount_users_count: {
            //số discount đã sử dụng
            type: Number,
            required: true,
        },
        discount_users_used: {
            //ai đã dùng
            type: Array,
            default: [],
        },
        discount_max_uses_per_user: {
            //số lượng cho phép tối đa được sử dụng mỗi user
            type: Number,
            required: true,
        },
        discount_min_order_value: {
            type: Number,
            required: true,
        },
        discount_shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        discount_is_active: {
            type: Boolean,
            default: true,
        },
        discount_applies_to: {
            type: String,
            require: true,
            enum: ["all", "specific"],
            default: "all",
        },
        discount_product_ids: {
            //Số sản phẩm được áp dụng
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
