'use strict'

const mongoose = require('mongoose');
const connectionString = 'mongodb://sa:123123@localhost:27017/shopDEV?authSource=admin';
const { countConnect } = require('../helpers/check.connect');

class Database {
    constructor() {
        this.connect();
    }
    //connect method to establish a connection
    connect(type = 'mongodb') {
        //dev
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', {
                color: true,
            });
        }
        // Connect to MongoDB
        mongoose.connect(connectionString, {
            maxPoolSize: 50, // Maximum number of connections in the pool
        }).then(() => {
            countConnect();
            console.log('MongoDB PROD connected successfully');
        })
            .catch(err => console.error('MongoDB connection error:', err));
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

}

const instanceMongoDB = Database.getInstance();

module.exports = instanceMongoDB;