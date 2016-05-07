"use strict";

const Blessed = require("blessed");

// Core init
// Create a screen object.
var screen = global.screen = Blessed.screen({
    smartCSR: true
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

screen.title = 'Buttercup';

// Application

const MenuBar = require("./classes/MenuBar.js");

var menu = new MenuBar();
menu.appendToScreen(screen);
menu.element.focus();
