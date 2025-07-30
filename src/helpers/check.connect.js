'use strict'

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECOND = 5000; // 5 seconds

//count active connections
// This function counts the number of active connections to the MongoDB database
const countConnect = () => {
    const numConnections = mongoose.connections.length;
    console.log(`Number of active connections: ${numConnections}`);
}

const checkOverload = () => {
    setInterval(() => {
        const numConnections = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss; // Resident Set Size (RSS) memory usage

        //Example maximum number of connections based on CPU cores
        const maxConnections = numCores * 5; // Example: 5 connections per core

        console.log(`Number of active connections: ${numConnections}`);
        console.log(`Number of CPU cores: ${numCores}`);
        console.log(`Memory usage (RSS): ${memoryUsage / 1024 / 1024} MB`);

        if (numConnections > maxConnections) {
            console.warn(`Warning: Number of active connections (${numConnections}) exceeds the recommended limit (${maxConnections}).`);
            //notify.sendNotification(...);
        }
    }, _SECOND); // Monitor every 5 seconds
}

module.exports = { countConnect, checkOverload };