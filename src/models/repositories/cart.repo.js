"use strict";

const cartModel = require("../cart.model");
const { convertToObjectIdMongoDB } = require("../../ultils");
const findCartById = async (cardId) => {
    return await cartModel.findOne({ _id: convertToObjectIdMongoDB(cardId), cart_state: "active" }).lean();
};
module.exports = {
    findCartById,
};
