'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keytoken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');

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
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1', // 'Public Key Cryptography Standards 1'
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1', // 'Public Key Cryptography Standards 1'
                        format: 'pem'
                    }
                });

                console.log("Private Key:", privateKey.toString());
                console.log("Public Key:", publicKey.toString());

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                });

                if (!publicKeyString) {
                    return {
                        code: 'xxx',
                        message: 'Failed to create key token',
                        status: 'error'
                    }
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString);

                // Create token pair
                const tokens = await createTokenPair(
                    { userId: newShop._id, email: newShop.email, roles: newShop.roles },
                    publicKeyObject, privateKey
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
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }

}

module.exports = AccessService;
