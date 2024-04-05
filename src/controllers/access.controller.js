"use strict";

const express = require("express");
const AccessService = require("../services/access.service");
const { CREATED } = require("../core/success.response");

class AccessController {
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered OK!",
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    };
}

module.exports = new AccessController();
