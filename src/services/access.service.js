'use strict'

const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keytoken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { ceil, find } = require('lodash');
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    /*
        check this token used?
    */
    static handleRefreshToken = async (refreshToken) => {
        //check xem token này đã được sử dụng chưa
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        //nếu có
        if (foundToken) {
            // decode xem mày là thằng nào
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log("(1)--", { userId, email });
            // xóa tất cả token trong keyStore
            await KeyTokenService.deleteKeyTokenByUserId(userId);
            throw new ForbiddenError('Something went wrong, please login again');
        }

        // NO - quá ngon
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) throw new AuthFailureError('Shop not found with this refresh token');
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log("(2)--", { userId, email });
        // check useId 
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError('Shop not found with this email');

        //create 1 cặp mới
        const tokens = await createTokenPair(
            { userId, email: foundShop.email, roles: foundShop.roles }, holderToken.publicKey, holderToken.privateKey);
        // update lại refreshToken
        await KeyTokenService.updateKeyToken(holderToken._id, {
            refreshToken: tokens.refreshToken,
            refreshTokensUsed: refreshToken
        });


        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop
            }),
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        }

    };

    static logout = async (keyStore) => {
        const deleteKey = await KeyTokenService.removeKeyTokenById(keyStore._id);
        console.log("Key deleted successfully:", deleteKey);
        return deleteKey;
    };

    /*
        1 - check email in dbs
        2 - match password
        3 - create AT vs RT and save
        4 - generate tokens
        5 - get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {

        //1. check email in dbs
        const foundShop = await findByEmail({ email });
        if (!foundShop) {
            throw new BadRequestError('Shop does not exist with this email');
        }

        //2. match password
        const isMatch = await bcrypt.compare(password, foundShop.password);
        if (!isMatch) {
            throw new AuthFailureError('Password is not correct');
        }

        //3. create AT vs RT and save
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        console.log("Private Key:", privateKey);
        console.log("Public Key:", publicKey);

        //4. generate tokens
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId, email: foundShop.email, roles: foundShop.roles },
            publicKey, privateKey
        );

        const publicKeyString = await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
        });

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop
            }),
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        }
    }

    static signUp = async ({ name, email, password }) => {
        //step1: check if user already exists
        const holderShop = await shopModel.findOne({ email }).lean();

        if (holderShop) {
            throw new BadRequestError('Shop already exists with this email');
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
        return {
            code: 200,
            metadata: null
        }
    }

}

module.exports = AccessService;
