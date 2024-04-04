"use strict";

const { asyncHandle } = require("../../auth/checkAuth");
const accessController = require("../../controllers/access.controller");

const express = require("express");
const router = express.Router();

//sign up
router.post("/shop/signup", asyncHandle(accessController.signUp));

module.exports = router;