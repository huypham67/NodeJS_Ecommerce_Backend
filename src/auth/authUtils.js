'use strict'

const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keytoken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESH_TOKEN: 'x-refresh-token',
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // Create access token
        const accessToken = await jwt.sign(payload, privateKey, {
            expiresIn: '2 days'
        });

        // Create refresh token
        const refreshToken = await jwt.sign(payload, privateKey, {
            expiresIn: '7 days'
        });

        //
        jwt.verify(accessToken, publicKey, (err, decoded) => {
            if (err) {
                console.error('Access token verification failed:', err);
            } else {
                console.log('Access token is valid:', decoded);
            }
        });

        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1 - Check userId missing???
        2 - get accessToken
        3 - verifyToken
        4 - check user in dbs
        5 - check keyStore with this userId?
        6 - OK all => return next()
    */

    //1
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Missing userId in request headers');

    //2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('KeyStore not found for this userId');

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new AuthFailureError('Missing access token in request headers');

    try {
        const decodedUser = jwt.verify(accessToken, keyStore.privateKey); //nếu token không hợp lệ sẽ ném lỗi 
        if (userId !== decodedUser.userId) {
            throw new AuthFailureError('Invalid userId in access token');
        }
        req.keyStore = keyStore;
        req.user = decodedUser; // decodedUser chứa thông tin người dùng đã được xác thực
        return next();
    } catch (error) {
        // 👇 Phân biệt rõ lỗi
        if (error.name === 'TokenExpiredError') {
            throw new AuthFailureError('Access token expired');
        }

        if (error.name === 'JsonWebTokenError') {
            throw new AuthFailureError('Invalid access token');
        }

        // fallback
        throw new AuthFailureError('Access token verification failed');
    }

});

const authenticationV2 = asyncHandler(async (req, res, next) => {

    //1
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError('Missing userId in request headers');

    //2
    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError('KeyStore not found for this userId');

    //3
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
    if (refreshToken) {
        try {
            const decodedUser = jwt.verify(refreshToken, keyStore.privateKey); //nếu token không hợp lệ sẽ ném lỗi 
            if (userId !== decodedUser.userId) {
                throw new AuthFailureError('Invalid userId in access token');
            }
            req.keyStore = keyStore;
            req.user = decodedUser; // decodedUser chứa thông tin người dùng đã được xác thực
            req.refreshToken = refreshToken; // Lưu refresh token vào req để sử dụng sau này
            return next();
        } catch (error) {
            // 👇 Phân biệt rõ lỗi
            if (error.name === 'TokenExpiredError') {
                throw new AuthFailureError('Access token expired');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new AuthFailureError('Invalid access token');
            }

            // fallback
            throw new AuthFailureError('Access token verification failed');
        }
    }

});

const verifyJWT = async (token, keySecret) => {
    return jwt.verify(token, keySecret);
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
};