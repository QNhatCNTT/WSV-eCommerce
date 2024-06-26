"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "orders";

// Declare the Schema of the Mongo model
const orderShema = new Schema(
    {
        order_userId: {
            type: Number,
            required: true,
        },
        order_checkout: {
            type: Object,
            default: {},
        },
        /*
        order_checkout: {
            totalPrice,
            totalApplyDiscount,
            feeShip,
        },
         */
        order_shipping: {
            type: Object,
            default: {},
        },
        /*
        street
        city
        state
        country
         */
        order_payment: {
            type: Object,
            default: {},
        },
        order_products: {
            type: Object,
            default: null,
        },
        order_trackingNumber: {
            type: String,
            default: "#0000118052022",
        },
        order_status: {
            type: String,
            emun: ["pending", "confirmed", "shipped", "cancelled", "delivered"],
            default: "pending",
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
module.exports = model(DOCUMENT_NAME, orderShema);
