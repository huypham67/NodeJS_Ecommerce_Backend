'use restrict'

const mongoose = require('mongoose');

const connectionString = 'mongodb://sa:123123@localhost:27017/shopDEV?authSource=admin';
mongoose.connect(connectionString)
    .then(_ => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

//dev
if (1 === 1) {
    mongoose.set('debug', true);
    mongoose.set('debug', {
        color: true,
    });
}

module.exports = { mongoose };