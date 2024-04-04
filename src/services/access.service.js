"use strict";
const bcrypt = require("bcrypt");
const shopModel = require("../models/shop.model");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUltils");
const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            // step 1: check email existed??
            const holderShop = await shopModel.findOne({ email }).lean();
            if (holderShop) {
                return {
                    code: "xxxx",
                    message: "Shop already registered",
                };
            }

            // step 2: create shop
            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({ name, email, password: passwordHash, roles: [RoleShop.SHOP] });

            if (newShop) {
                // create privateKey, publicKey
                const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
                    modulusLength: 4096,
                });

                console.log({ publicKey, privateKey });
                const publicKeyString = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                });

                if (!publicKeyString) {
                    return {
                        code: "xxxx",
                        message: "publicKeyString error",
                    };
                }

                //create token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyString, privateKey);
                console.log(`Create Token Success::`, tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: newShop,
                        tokens,
                    },
                };
            }
        } catch (error) {
            return {
                code: "xxx",
                message: error.message,
                status: "error",
            };
        }
    };
}

module.exports = AccessService;
