require('dotenv').config();

'use strict'

//level 0
// const dev = {
//     app: {
//         port: 3000
//     },
//     db: {
//         host: 'localhost',
//         port: 27017,
//         name: 'dbDev',
//         user: 'sa',
//         password: '123123',
//         authSource: 'admin',
//     }
// }

//level 1

//level 2
const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3000
    },
    db: {
        host: process.env.DEV_DB_HOST || 'localhost',
        port: process.env.DEV_DB_PORT || 27017,
        name: process.env.DEV_DB_NAME || 'shopDEV',
        user: process.env.DEV_DB_USER || 'sa',
        password: process.env.DEV_DB_PASSWORD || '123123',
        authSource: process.env.DEV_DB_AUTH_SOURCE || 'admin',
    }
}

const prod = {
    app: {
        port: process.env.PROD_APP_PORT || 3055
    },
    db: {
        host: process.env.PROD_DB_HORT || 'localhost',
        port: process.env.PROD_DB_PORT || 27017,
        name: process.env.PROD_DB_NAME || 'shopPROD',
        user: process.env.PROD_DB_USER || 'sa',
        password: process.env.PROD_DB_PASSWORD || '123123',
        authSource: process.env.PROD_DB_AUTH_SOURCE || 'admin',
    }
}

const config = { dev, prod };
const env = process.env.NODE_ENV || 'dev';
module.exports = config[env];