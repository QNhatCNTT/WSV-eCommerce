"use strict";

const accessController = require("../../controllers/access.controller");
const express = require("express");
const { asyncHandle } = require("../../helpers/asyncHandle");
const { authentication } = require("../../auth/authUltils");
const router = express.Router();

//sign up
router.post("/shop/signup", asyncHandle(accessController.signUp));
//sign in
router.post("/shop/signin", asyncHandle(accessController.singIn));

//authentication
router.use(authentication);

//sign out
router.post("/shop/signout", asyncHandle(accessController.singOut));

module.exports = router;
