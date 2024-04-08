"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {

    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Create discount success!",
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    getAllDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all discount code success!",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "Get discount amount success!",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            }),
        }).send(res);
    };

    getAllDiscountCodeWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all discount code with product success!",
            metadata: await DiscountService.getAllDiscountCodesWithProducts({
                ...req.query,
            }),
        }).send(res);
    };

    getAllDiscountCodesByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all discount by shop success!",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
            }),
        }).send(res);
    };
}
module.exports = new DiscountController();