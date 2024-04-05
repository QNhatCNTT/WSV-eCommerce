"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandle } = require("../helpers/asyncHandle");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
    CLIENT_ID: "x-client-id",
};
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: "2 days",
        });

        // refreshToken
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: "7 days",
        });

        //verify
        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`error verify`, err);
            } else {
                console.log(`decode verify`, decode);
            }
        });
        return { accessToken, refreshToken };
    } catch (error) {
        return error;
    }
};

/*
        1 - Check userId missing???
        2 - get accessToken
        3 - verifyToken
        4 - check user in dbs
        5 - check keyStore with this userId?
        6 - OK all => return next()
     */
const authentication = asyncHandle(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID];
    //1
    if (!userId) throw new AuthFailureError("Invalid Request");
    //2
    const keyStore = await findByUserId(userId);
    console.log({keyStore})
    if (!keyStore) throw new NotFoundError("Not fount keyStore");

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError("Invalid Request");

    //4
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        console.log({decodeUser})
        //5
        if (userId !== decodeUser.userId) throw new AuthFailureError("Invalid UserId");
        //6
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw next(error);
    }
});

module.exports = {
    createTokenPair,
    authentication,
};
