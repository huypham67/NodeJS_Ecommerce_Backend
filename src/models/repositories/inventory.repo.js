'use strict'

const { Types } = require("mongoose");
const { inventory } = require("../inventory.model")

const insertInventory = async ({
    productId, shopId, stock, location = 'unKnown'
}) => {
    console.log("Inserting inventory: ", {
        productId, shopId, stock, location
    });
    return await inventory.create({
        inventory_productId: productId,
        inventory_shopId: new Types.ObjectId(shopId),
        inventory_stock: stock,
        inventory_location: location
    })
}

module.exports = {
    insertInventory
}