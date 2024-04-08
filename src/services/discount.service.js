"use strict";

const discountModel = require("../models/discount.model");
const { convertToObjectIdMongoDB } = require("../ultils");
const {
    updateDiscountById,
    findAllDiscountCodeUnSelect,
    checkDiscountExists,
    findAllDiscountCodeSelect,
} = require("../models/repositories/discount.repo");
const { NotFoundError, BadRequestError } = require("../core/error.response");
const { findAllProducts } = require("../models/repositories/product.repo");

/**
 * Discount services
 * 1- Generator discount code [shop | admin]
 * 2 - Get discount amount [user]
 * 3 - Get all discount codes [user | shop]
 * 4 - Verify discount code [user]
 * 5 - Delete discount code [admin | shop]
 * 6 - Cancel discount code [user]
 */

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            users_count,
            max_uses_per_user,
            users_used,
        } = payload;
        //kiem tra
        // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        //     throw new BadRequestError("Discount code has expired!");
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be before end date!");
        }

        //create index for discount code
        const foundDiscount = await discountModel
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongoDB(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.discount_is_active) throw new BadRequestError("Discount exists!");

        const newDiscount = await discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_users_count: users_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscount() {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
            },
        });
        if (!foundDiscount) throw new NotFoundError("Discount does not exists!");
        const objectParams = removeUnderfinedObject(this);
        const updateProduct = await updateDiscountById({
            discountId: foundDiscount._id,
            bodyUpdate: objectParams,
            model: discountModel,
        });
        return updateProduct;
    }

    /**
     * get all discount codes available with products
     */
    static async getAllDiscountCodesWithProducts({ code, shopId, userId, limit, page }) {
        //create index for discount code
        const foundDiscount = await discountModel
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongoDB(shopId),
            })
            .lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) throw new NotFoundError("Discount code not exists!");

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === "all") {
            //get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongoDB(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        if (discount_applies_to === "specific") {
            //get the product ids
            products = await findAllProducts({
                filter: {
                    _id: {
                        $in: discount_product_ids,
                    },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        return products;
    }

    /**
     * get all discount codes of shop
     */
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodeSelect({
            filter: {
                discount_shopId: convertToObjectIdMongoDB(shopId),
                discount_is_active: true,
            },
            limit: +limit,
            page: +page,
            select: ["discount_name", "discount_code"],
            model: discountModel,
        });

        return discounts;
    }

    /**
     * Apply discount code
     */
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDB(shopId),
            },
        });
        if (!foundDiscount) throw new NotFoundError("Discount doesnot exists!");

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_value,
            discount_start_date,
            discount_end_date,
        } = foundDiscount;
        if (!discount_is_active) throw new NotFoundError("discount expired!");
        if (!discount_max_uses) throw new NotFoundError("discount are out!");
        if (
            new Date() < new Date(discount_start_date) ||
            new Date() > new Date(discount_end_date)
        )
            throw new NotFoundError("discount code has expired!");
        //check xem có xét giá trị tối thiểu hay không
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            //get total
            totalOrder = products.reduce((acc, product) => acc + product.quantity * product.price, 0);
            if (totalOrder < discount_min_order_value)
                throw new NotFoundError(`discount requires a minimum order value of ${discount_min_order_value}!`);
        }

        if (discount_max_uses_per_user > 0) {
            const userUseDiscount = discount_users_used.find((user) => user.userId === userId);
            if (userUseDiscount) {
                //
            }
        }

        //check xem discount là fixed_amount hay percentage
        const amount = discount_type === "fixed_amount" ? discount_value : totalOrder * (discount_value / 100);
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    /**
     * Delete discount code
     */
    static async deleteDiscount({ shopId, codeId }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDB(shopId),
            },
        });
        if (!foundDiscount) throw new NotFoundError("Discount does not exists!");

        const deleted = await discountModel.findByIdAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDB(shopId),
        });
        return deleted;
    }

    /**
     * Cancel discount code
     */

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDB(shopId),
            },
        });
        if (!foundDiscount) throw new NotFoundError("Discount does not exists!");

        const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: -1,
                discount_users_count: -1,
            },
        });

        return result;
    }
}

module.exports = DiscountService;
