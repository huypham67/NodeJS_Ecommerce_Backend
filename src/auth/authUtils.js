'use strict'

const jwt = require('jsonwebtoken');
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // Create access token
        const accessToken = await jwt.sign(payload, publicKey, {
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

module.exports = {
    createTokenPair
};