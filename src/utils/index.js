'use strict'

const _ = require('lodash');

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
}

const getSelectData = (select = []) => {
    return Object.fromEntries(
        select.map(field => [field, 1])
    );
}

const getUnselectData = (unselect = []) => {
    return Object.fromEntries(
        unselect.map(field => [field, 0])
    );
}

const removeUndefinedFields = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === undefined || obj[key] === null) {
            delete obj[key];
        }
    });
    return obj;
}

const updateNestedObjectParser = (obj) => {
    console.log("(3):: ", obj);
    const final = {};
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const nestedObj = updateNestedObjectParser(obj[key]);
            Object.keys(nestedObj).forEach(nestedKey => {
                final[`${key}.${nestedKey}`] = nestedObj[nestedKey];
            });

        } else {
            final[key] = obj[key];
        }
    });
    console.log("(4):: ", final);
    return final;
}

module.exports = {
    getInfoData,
    getSelectData,
    getUnselectData,
    removeUndefinedFields,
    updateNestedObjectParser
};