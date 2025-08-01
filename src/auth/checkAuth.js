'use strict'

const { head, find } = require("lodash");
const { findById } = require("../services/apikey.service");

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY];
        if (!key) {
            return res.status(403).json({
                message: 'Forbidden: API key is required',
            });
        }

        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbidden: Invalid API key',
            });
        }

        req.objKey = objKey;
        return next();
    } catch (error) {
        next(error);
    }
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey || !req.objKey.permissions.includes(permission)) {
            return res.status(403).json({
                message: 'Forbidden: Insufficient permissions',
            });
        }

        console.log(`Permission check passed for: ${permission}`);

        return next();
    }
}

module.exports = {
    apiKey,
    permission
};