"use strict";

const { unGetSelectData, getSelectData } = require("../../ultils");

const updateDiscountById = async ({ discountId, bodyUpdate, model }) => {
    return await model.findByIdAndUpdate(discountId, bodyUpdate, { new: true });
};

const findAllDiscountCodeUnSelect = async ({ limit = 50, page = 1, sort = "ctime", filter, unSelect, model }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const discounts = await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean();
    return discounts;
};

const findAllDiscountCodeSelect = async ({ limit = 50, page = 1, sort = "ctime", filter, select, model }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const discounts = await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();
    return discounts;
};

const checkDiscountExists = async ({ model, filter }) => {
    return await model.findOne(filter).lean();
}

module.exports = {
    updateDiscountById,
    findAllDiscountCodeUnSelect,
    findAllDiscountCodeSelect,
    checkDiscountExists
};
