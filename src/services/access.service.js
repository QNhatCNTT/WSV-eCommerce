"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUltils");
const { getInfoData } = require("../ultils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static singIn = async ({ email, password, refreshToken = null }) => {
        // step 1: check email is dbs
        // step 2: match password
        // step 3: create AT vs RT and save
        // step 4: generate tokens
        // step 5: get data return login

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

            console.log({ publicKey, privateKey });
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
            console.log(`Create Token Success::`, tokens);

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
}

module.exports = AccessService;
