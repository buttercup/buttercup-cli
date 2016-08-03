#!/usr/bin/env node

"use strict";

const mainMenu = require("./nav/main-menu.js");

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
process.on("exit", function() {
    console.log("exit", arguments);
});

return mainMenu
    .presentMenu()
    .then(function() {
        console.log("Ending");
    })
    .catch(function(err) {
        console.error("Process failed");
        setTimeout(function() {
            throw err;
        }, 0);
    });
