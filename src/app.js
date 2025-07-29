const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

// init middlewares
app.use(morgan('dev')); // Log HTTP requests
app.use(helmet()); // Set security-related HTTP headers
app.use(compression()); // Compress response bodies for better performance

// morgan('dev')
// morgan('tiny');
// morgan('combined');
// morgan('common');
// morgan('short');

// init db

// init routes
app.get('/', (req, res, next) => {
    const strCompression = 'Hello, World!';

    return res.status(200).json({
        message: 'Welcome to the Node.js E-commerce API',
        metadata: strCompression.repeat(10000)
    });
});

// handle errors

module.exports = app;