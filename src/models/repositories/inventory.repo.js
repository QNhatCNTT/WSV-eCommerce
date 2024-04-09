"use strict";

const { convertToObjectIdMongoDB } = require("../../ultils");
const inventoryModel = require("../inventory.model");

const insertInventory = async ({ productId, shopId, stock, location = "unKnown" }) => {
    return await inventoryModel.create({
        inven_productId: productId,
        inven_shopId: shopId,
        inven_stock: stock,
        inven_location: location,
    });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
            inven_productId: convertToObjectIdMongoDB(productId),
            inven_stock: { $gte: quantity },
        },
        updateSet = {
            $inc: {
                inven_stock: -quantity,
            },
            $push: {
                inven_reservations: {
                    quantity,
                    cartId,
                    createOn: new Date(),
                },
            },
        },
        options = {
            upsert: true,
            new: true,
        };

    return await inventoryModel.findOneAndUpdate(query, updateSet, options);
};

module.exports = {
    insertInventory,
    reservationInventory,
};
