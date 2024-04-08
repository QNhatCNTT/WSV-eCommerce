"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {

    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new Cart success!",
            metadata: await CartService.addToCart(req.body),
        }).send(res);
    };

    //update +-
    update = async (req, res, next) => {
        new SuccessResponse({
            message: "update Cart success!",
            metadata: await CartService.updateCartV2(req.body),
        }).send(res);
    }

    deleteCartItem = async (req, res, next) => {
        new SuccessResponse({
            message: "delete cart item success!",
            metadata: await CartService.deletedUserCardItem(req.body),
        }).send(res);
    }

    listToCard = async (req, res, next) => {
        new SuccessResponse({
            message: "list Cart success!",
            metadata: await CartService.getListUserCart(req.body),
        }).send(res);
    }
}

module.exports = new CartController();
