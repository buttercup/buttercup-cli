"use strict";

const mainMenu = require("./nav/main-menu.js");

return mainMenu.presentMenu().catch(function(err) {
    setTimeout(function() {
        throw err;
    }, 0);
});
