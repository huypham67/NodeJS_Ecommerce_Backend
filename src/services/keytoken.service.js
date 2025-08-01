'use strict'

const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // level 0
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // });

            // return tokens ? tokens.publicKey : null;

            const filter = { user: userId };
            const update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            };
            const options = { upsert: true, new: true }; // upsert: true sẽ tạo mới nếu không tìm thấy user, 
            // còn new: true sẽ trả về document mới sau khi cập nhật
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    }
}

module.exports = KeyTokenService;