"use strict";

const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authenticationV2 } = require("../../auth/authUltils");
const inventoryController = require("../../controllers/inventory.controller");
const router = express.Router();


//authentication
router.use(authenticationV2);

router.post("", asyncHandle(inventoryController.addStockToInventory));

module.exports = router;
