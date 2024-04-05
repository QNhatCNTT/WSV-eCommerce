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

    singOut = async (req, res, next) => {
        console.log("singOut",{req})
        new SuccessResponse({
            message: "SingOut Success!",
            metadata: await AccessService.singOut(req.keyStore),
        }).send(res);
    };

    refreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: "Get token success!",
            metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
        }).send(res);
    }
}

module.exports = new AccessController();
