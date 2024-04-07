"use strict";

const { product, electronics, clothes, furniture } = require("../../models/product.model");
const { Types } = require("mongoose");
const { getSelectData, unGetSelectData } = require("../../ultils");

const findAllDrafts = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};

const findAllPulishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;
    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;
    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
};

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id")
        .sort({ updateAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();
};

const searchProduct = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);

    const results = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .lean();

    return results;
};

const findAllProducts = async ({ limit, page, sort, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    return await product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean().exec();
};

const findProduct = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect));
};

module.exports = {
    findAllDrafts,
    publishProductByShop,
    findAllPulishForShop,
    unPublishProductByShop,
    searchProduct,
    findAllProducts,
    findProduct,
};
