"use strict";

const productController = require("../../controllers/product.controller");
const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authenticationV2 } = require("../../auth/authUltils");
const router = express.Router();

router.get("/search/:keySearch", asyncHandle(productController.getListSearchProduct));
router.get("", asyncHandle(productController.findAllProducts));
router.get("/:product_id", asyncHandle(productController.findProduct));
//authentication
router.use(authenticationV2);
////////////
//createProduct
router.post("", asyncHandle(productController.createProduct));
router.patch('/:product_id', asyncHandle(productController.updateProduct));
router.post("/publish/:id", asyncHandle(productController.publishProduct));
router.post("/unpublish/:id", asyncHandle(productController.unPublishProduct));
//query//
router.get("/drafts/all", asyncHandle(productController.getAllDraftsForShop));
router.get("/publish/all", asyncHandle(productController.getAllPublishForShop));

module.exports = router;
