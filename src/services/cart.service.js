"use strict";

const { update } = require("lodash");
const cartModel = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");
const { NotFoundError } = require("../core/error.response");

/**
 * Key features: Cart Service
 * - add product to cart [user]
 * - reduce product quantity by one [user]
 * -increase product quantity by one [user]
 * - get cart [user]
 * - delete cart [user]
 * - delete cart item [user]
 */

class CartService {
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: "active" },
        updateOrInsert = {
            $addToSet: {
                cart_products: product,
            },
        },
        options = { upsert: true, new: true };
        return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = {
                cart_userId: userId,
                "cart_products.productId": productId,
                cart_state: "active",
            },
            updateSet = {
                $inc: {
                    "cart_products.$.quantity": quantity,
                },
            },
            option = {
                upsert: true,
                new: true,
            };
        return await cartModel.findOneAndUpdate(query, updateSet, option);
    }

    static async addToCart({ userId, product = {} }) {
        //check cart có tồn tại hay không?
        const userCart = await cartModel.findOne({ cart_userId: userId });
        if (!userCart) {
            //create cart for User
            return await CartService.createUserCart({ userId, product });
        }

        //nếu có giỏ hàng rồi nhưng chưa có sản phẩm???
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];

            return await userCart.save();
        }

        //gió hàng tồn tại, và có sản phẩm này thì update quantity
        return await CartService.updateUserCartQuantity({ userId, product });
    }

    //update cart
    /**
     * shop_order_ids: [
     *      {
     *              shopId
     *              item_products: [
     *              {
     *                  quantity,
     *                  price,
     *                  shopId,
     *                  old_quantity,
     *                  productId
     *               }
     *          ]
     *      }
     * ]
     */
    static async updateCartV2({ userId, shop_order_ids = {} }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];
        //check product có tồn tại không?
        const foundProduct = await getProductById({ productId });
        if (!foundProduct) throw new NotFoundError("Product not found");

        //compare
        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError("Product do not belong to the shop");
        }

        if (quantity === 0) {
            //deleted card item
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    /**
     * deleted card item
     */
    static async deletedUserCardItem({ userId, productId }) {
        const query = {
                cart_userId: userId,
                cart_state: "active",
            },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId,
                    },
                },
            };
        const deleteCart = await cartModel.updateOne(query, updateSet);

        return deleteCart;
    }

    static async getListUserCart({ userId }) {
        return await cartModel.findOne({ cart_userId: +userId }).lean();
    }
}

module.exports = CartService;
