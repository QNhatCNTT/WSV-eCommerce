"use strict";

const productController = require("../../controllers/product.controller");
const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authentication } = require("../../auth/authUltils");
const router = express.Router();

//authentication
router.use(authentication);
////////////
//createProduct
router.post("", asyncHandle(productController.createProduct));

module.exports = router;
