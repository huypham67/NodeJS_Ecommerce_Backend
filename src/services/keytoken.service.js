'use strict'

const { Types } = require("mongoose");
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

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
    };

    static removeKeyTokenById = async (keyId) => {
        return await keyTokenModel.deleteOne({ _id: new Types.ObjectId(keyId) });
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken }).lean();
    }

    static deleteKeyTokenByUserId = async (userId) => {
        return await keyTokenModel.findOneAndDelete({
            user: new Types.ObjectId(userId)
        });
    };

    static updateKeyToken = async (keyId, updateData) => {
        const update = {
            $set: {},
        };

        if (updateData.refreshToken) {
            update.$set.refreshToken = updateData.refreshToken;
        }

        if (updateData.refreshTokensUsed) {
            update.$addToSet = {
                refreshTokensUsed: updateData.refreshTokensUsed
            };
        }

        return await keyTokenModel.findByIdAndUpdate(
            keyId,
            update,
            { new: true }
        );
    };

}

module.exports = KeyTokenService;