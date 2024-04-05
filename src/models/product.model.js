"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
const productSchema = new Schema(
    {
        product_name: {
            type: String,
            required: true,
        },
        product_thumb: {
            type: String,
            required: true,
        },
        product_description: String,
        product_price: {
            type: Number,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        product_type: {
            type: String,
            required: true,
            emun: ["Electronics", "Clothing", "Furniture"],
        },
        product_shop: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        product_attributes: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

// define the product type = clothing
const clothingSchema = new Schema(
    {
        brand: {
            type: String,
            require: true,
        },
        size: String,
        material: String,
    },
    {
        collection: "clothes",
        timestamps: true,
    }
);

const ElectronicsSchema = new Schema(
    {
        manfactures: {
            type: String,
            require: true,
        },
        model: String,
        color: String,
    },
    {
        collection: "electronics",
        timestamps: true,
    }
);

//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothes: model("clothes", clothingSchema),
    electronics: model("electronics", ElectronicsSchema),
};
