"use strict";

const mainMenu = require("./nav/main-menu.js");

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
