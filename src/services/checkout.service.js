"use strict";
const { BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductsByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { accquireLock, releaseLock } = require("./redis.service");
class CheckoutService {
    /* {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [
                    {
                        shopId,
                        discountId,
                        codeId
                    }
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    } */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        //check cartId có tồn tại không?
        const foundCard = await findCartById(cartId);
        if (!foundCard) throw new BadRequestError("Cart does not exists!");

        const checkout_order = {
                totalPrice: 0, //tổng tiền hàng
                feeShip: 0, //phí vận chuyển
                totalDiscount: 0, //tổng tiền discount giảm giá
                totalCheckout: 0, //tổng tiền thanh toán
            },
            shop_order_ids_new = [];

        //tính tổng tiền bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i];
            console.log({ item_products, shop_discounts });
            //check product available
            const checkProductServer = await checkProductsByServer(item_products);
            console.log("checkProductServer::", checkProductServer);
            if (!checkProductServer[0]) throw new BadRequestError("order wrong!");

            //tổng tiền đơn hàng
            const checkoutPrice = checkProductServer.reduce((total, product) => {
                return total + product.price * product.quantity;
            }, 0);

            //tổng tiền trước khi xử lý
            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, //tiền trước khi giảm giá
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };
            console.log({ shop_discounts });
            // nếu shop_discounts tồn tại > 0, check xem có hợp lệ hay không
            if (shop_discounts.length > 0) {
                //giả sử chỉ có 1 discount
                //get amount discount
                const { discount = 0, totalPrice = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer,
                });

                //tổng discount giảm giá
                checkout_order.totalDiscount += discount;
                //nếu tiền giảm > 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            //tổng thanh toán cuối cùng
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }

    static async orderByUser({ shop_order_ids, cartId, userId, user_address = {}, user_payment = {} }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids,
        });

        //check lại một lần nữa xem vượt tồn kho hay không?
        //get new array products
        const products = shop_order_ids_new.flatMap((order) => order.item_products);
        console.log("products::[1]::", products);
        const accquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await accquireLock(productId, quantity, cartId);
            accquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        //check lại nếu có 1 sản phẩm hết hàng trong kho
        if (accquireProduct.includes(false)) {
            throw new BadRequestError("Mot so san pham da duoc cap nhat, vui long quay lai gio hang...");
        }

        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        });

        //trường hợp: nếu insert thành công, thì remove product có trong giỏ hàng
        if (newOrder) {
            //remove product trong giỏ hàng
        }
    }

    /*
    1> Query orders [user]
     */
    static async getOrdersByUser({ userId }) {}

    /*
    1> Query order using id [user]
     */
    static async getOneOrderByUser({ userId }) {}

    /*
    1> Cancel Order [user]
     */
    static async cancelOrderByUser({ userId }) {}

    /*
    1> Update Order Status [Shop | admin]
     */
    static async updateOrderStatusByShop({ userId }) {}
}
module.exports = CheckoutService;
