'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keytoken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { ceil } = require('lodash');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static signUp = async ({ name, email, password }) => {
        try {
            //step1: check if user already exists
            const holderShop = await shopModel.findOne({ email }).lean();

            if (holderShop) {
                return {
                    code: 'xxx',
                    message: 'Shop already exists',
                    status: 'error'
                }
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            });

            if (newShop) {
                // create privateKey, publicKey
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1', // 'Public Key Cryptography Standards 1'
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1', // 'Public Key Cryptography Standards 1'
                //         format: 'pem'
                //     }
                // });

                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                console.log("Private Key:", privateKey);
                console.log("Public Key:", publicKey);

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                });

                if (!keyStore) {
                    return {
                        code: 'xxx',
                        message: 'Failed to create key token',
                        status: 'error'
                    }
                }

                // Create token pair
                const tokens = await createTokenPair(
                    { userId: newShop._id, email: newShop.email, roles: newShop.roles },
                    publicKey, privateKey
                );

                console.log("Tokens created successfully:", tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({
                            fields: ['_id', 'name', 'email'],
                            object: newShop
                        }),
                        tokens: {
                            accessToken: tokens.accessToken,
                            refreshToken: tokens.refreshToken
                        }
                    }
                }
            }
            return {
                code: 200,
                metadata: null
            }

        } catch (error) {
            console.error("Error in signUp:", error);
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }

}

module.exports = AccessService;
