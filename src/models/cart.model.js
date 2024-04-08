"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "carts";

// Declare the Schema of the Mongo model
const cartSchema = new Schema(
    {
        cart_state: {
            type: String,
            required: true,
            enum: ["active", "completed", "failed", "pending"],
            default: "active",
        },
        cart_products: {
            /**
             * [
             *    {
             *         productId
             *         shopId,
             *         quantity
             *         name
             *         price
             *      }
             * ]
             */
            type: Array,
            required: true,
            default: [],
        },
        cart_count_product: {
            type: Number,
            required: true,
            default: 0,
        },
        cart_userId: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "createdOn",
            updatedAt: "modifiedOn",
        },
        collection: COLLECTION_NAME,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, cartSchema);
