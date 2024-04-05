"use strict";

const { asyncHandle } = require("../../auth/checkAuth");
const accessController = require("../../controllers/access.controller");

const express = require("express");
const router = express.Router();

//sign up
router.post("/shop/signup", asyncHandle(accessController.signUp));
router.post("/shop/singin", asyncHandle(accessController.singIn));

module.exports = router;