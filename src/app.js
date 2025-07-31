const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

// init middlewares
app.use(morgan('dev')); // Log HTTP requests
app.use(helmet()); // Set security-related HTTP headers
app.use(compression()); // Compress response bodies for better performance
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// morgan('dev')
// morgan('tiny');
// morgan('combined');
// morgan('common');
// morgan('short');

// init db
require('./dbs/init.mongodb');
const { checkOverload } = require('./helpers/check.connect');
//checkOverload(); // Monitor active connections and system load

// init routes
app.use('', require('./routes'));

// handle errors

module.exports = app;