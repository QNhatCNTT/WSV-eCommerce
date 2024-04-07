"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductServiceV2 = require("../services/product.service.xxx");
// const ProductService = require("../services/product.service");

class ProductController {

    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: "Create new Product success",
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId,
        //     }),
        // }).send(res);

        new SuccessResponse({
            message: "Create new Product success",
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish product success",
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            }),
        }).send(res);
    }

    unPublishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "unPublish product success",
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            }),
        }).send(res);
    }

    //query//
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Draft success!",
            metadata: await ProductServiceV2.findAllDrafts({ product_shop: req.user.userId }),
        }).send(res);
    };

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Publish success!",
            metadata: await ProductServiceV2.findAllPublishForShop({ product_shop: req.user.userId }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list search product success!",
            metadata: await ProductServiceV2.getListSearchProduct(req.params),
        }).send(res);
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list findAllProducts success!",
            metadata: await ProductServiceV2.findAllProducts(req.query),
        }).send(res);
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get product success!",
            metadata: await ProductServiceV2.findProduct({product_id: req.params.product_id}),
        }).send(res);
    }
    //end query//
}
module.exports = new ProductController();
