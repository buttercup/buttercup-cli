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
const App = require("./classes/Application.js");
var app = new App(screen);

const MenuBar = require("./classes/MenuBar.js");

var menu = new MenuBar();
menu.setApplication(app);
menu.appendToScreen(screen);
menu.focus();
