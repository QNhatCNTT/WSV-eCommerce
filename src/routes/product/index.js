"use strict";

const productController = require("../../controllers/product.controller");
const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authenticationV2 } = require("../../auth/authUltils");
const router = express.Router();

//authentication
router.use(authenticationV2);
////////////
//createProduct
router.post("", asyncHandle(productController.createProduct));

module.exports = router;
