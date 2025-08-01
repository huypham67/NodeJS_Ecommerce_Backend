'use strict'

const express = require('express');
const { apiKey, permission } = require('../auth/checkAuth');
const router = express.Router();

// check apiKey
router.use(apiKey);

// check permission
router.use(permission('0000'));

router.use('/v1/api', require('./access'));
router.get('/', (req, res, next) => {
    const strCompression = 'Hello, World!';

    return res.status(200).json({
        message: 'Welcome to the Node.js E-commerce API',
        //metadata: strCompression.repeat(10000)
    });
});

module.exports = router;