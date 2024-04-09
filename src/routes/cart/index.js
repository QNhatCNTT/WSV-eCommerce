"use strict";

const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authenticationV2 } = require("../../auth/authUltils");
const cartController = require("../../controllers/cart.controller");
const router = express.Router();

router.post("", asyncHandle(cartController.addToCart));
router.delete("", asyncHandle(cartController.deleteCartItem));
router.post("/update", asyncHandle(cartController.update));
router.get("", asyncHandle(cartController.listToCard));

module.exports = router;
