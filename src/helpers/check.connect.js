"use strict";

const mongoose = require("mongoose");
const os = require('os');
const process = require('process');

const _SECONDS = 5000;
//count connect
const countConnect = () => {
    const numConnect = mongoose.connections.length;
    console.log(`Number of connections: ${numConnect}`);
};

//check over load
const checkOverLoad = () => {
    setInterval(() => {
        const numConnections = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        //Example maximun number of connections based on number of cores
        const maxConnections = numCores * 5;

        console.log(`Active connections: ${numConnections}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024}MB`);

        if(numConnections > maxConnections) {
            console.log("Connection overload detected");
            //notify.send(...);
        }

    }, _SECONDS); //Monitor every 5 seconds
}

module.exports = {
    countConnect,
    checkOverLoad
};
