"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUltils");
const { getInfoData } = require("../ultils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    // step 1: check email is dbs
    // step 2: match password
    // step 3: create AT vs RT and save
    // step 4: generate tokens
    // step 5: get data return login
    static singIn = async ({ email, password, refreshToken = null }) => {
        // step 1: check email is dbs
        const foundShop = await findByEmail({ email });

        if (!foundShop) {
            throw new BadRequestError("Shop not registered!");
        }
        // step 2: match password
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) {
            throw new AuthFailureError("Authentication error!");
        }

        // step 3: create AT vs RT and save
        const publicKey = crypto.randomBytes(64).toString("hex");
        const privateKey = crypto.randomBytes(64).toString("hex");

        const { _id: userId } = foundShop;
        // step 4: generate tokens
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken,
        });
        // step 5: get data return login
        return {
            shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop }),
            tokens,
        };
    };

    static signUp = async ({ name, email, password }) => {
        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError("Error: Shop already registered!");
        }

        // step 2: create shop
        const passwordHash = await bcrypt.hash(password, 10);
        const newShop = await shopModel.create({ name, email, password: passwordHash, roles: [RoleShop.SHOP] });

        if (newShop) {
            // create privateKey, publicKey advanced method
            const publicKey = crypto.randomBytes(64).toString("hex");
            const privateKey = crypto.randomBytes(64).toString("hex");

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                throw new BadRequestError("Error: keyStore error!");
            }

            //create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop }),
                    tokens,
                },
            };
        }
        return {
            code: 200,
            metadata: null,
        };
    };

    static singOut = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return delKey;
    };

    // check this token used?
    static handlerRefreshToken = async (refreshToken) => {
        //check xem token da duoc su dung hay chua
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        //neu co
        if (foundToken) {
            //decode xem user la ai
            const { userId, email } = await verifyJWT(foundToken.refreshToken, foundToken.privateKey);
            console.log({ userId, email });

            //xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("Something wrong happend! Pls relogin");
        }

        //chua co
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) {
            throw new AuthFailureError("Shop not registered 1!");
        }

        //verifyToken
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log("[user 2]:::", { userId, email });
        //check UserId
        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new AuthFailureError("Shop not registered 2!");
        }

        //create 1 cap token moi
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey);

        //update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };
}

module.exports = AccessService;
