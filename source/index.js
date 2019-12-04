const minimist = require("minimist");
const { initialise } = require("./library/init.js");

const argv = minimist(process.argv.slice(2));
const {
    config = null
} = argv;

initialise(config);
