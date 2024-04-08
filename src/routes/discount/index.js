"use strict";

const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authenticationV2 } = require("../../auth/authUltils");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();

//get amount a discount
router.post("/amount", asyncHandle(discountController.getDiscountAmount));
router.get("/list_product_code", asyncHandle(discountController.getAllDiscountCodeWithProduct));

//authentication
router.use(authenticationV2);

router.post("", asyncHandle(discountController.createDiscountCode));
router.get("", asyncHandle(discountController.getAllDiscountCodesByShop));
module.exports = router;
