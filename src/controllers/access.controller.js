"use strict";

const express = require("express");
const AccessService = require("../services/access.service");
const { SuccessResponse, CREATED } = require("../core/success.response");

class AccessController {
    singIn = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.singIn(req.body),
        }).send(res);
    };
    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered OK!",
            metadata: await AccessService.signUp(req.body),
        }).send(res);
    };
}

module.exports = new AccessController();
