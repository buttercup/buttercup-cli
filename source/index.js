#!/usr/bin/env node

"use strict";

const argv = require("minimist")(process.argv.slice(2));

const openArchiveHandler = require("./nav/open-archive.js");
const mainMenu = require("./nav/main-menu.js");

let archiveFilename = argv._[0];

if (archiveFilename) {
    return openArchiveHandler
        .openFile(archiveFilename);
}

return mainMenu
    .presentMenu()
    .then(function() {
        console.log("Goodbye.");
    })
    .catch(function(err) {
        console.error("Process failed...");
        setTimeout(function() {
            throw err;
        }, 0);
    });
