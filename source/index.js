const minimist = require("minimist");
const { initialise } = require("./library/init.js");
const { printButtercupWelcome } = require("./menu/misc.js");

const argv = minimist(process.argv.slice(2));
const {
    config = null
} = argv;

initialise(config);


// Start regular GUI operation:
printButtercupWelcome();
