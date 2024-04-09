"use strict";

const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authenticationV2 } = require("../../auth/authUltils");
const checkoutController = require("../../controllers/checkout.controller");
const router = express.Router();

router.post("/review", asyncHandle(checkoutController.checkoutReview));

module.exports = router;
