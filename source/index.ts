#!/usr/bin/env node

import minimist from "minimist";
import chalk from "chalk";
import boxen from "boxen";
import { logError } from "./library/error";
import { markInstalledVersion } from "./library/config";
import { ArgV } from "./types";
import { add as addVault } from "./commands/add";
const packageInfo = require("../package.json");

function help() {
    console.log("Usage: bcup <command> [options]");
    console.log("");
    console.log("Buttercup (bcup) is a command-line application that allows for interacting");
    console.log("with Buttercup password vaults.");
    console.log("");
    console.log("Options:");
    console.log("\t-h, --help\t\tShow this help message.");
    console.log("\t-v, --version\t\tShow version information");
    console.log("");
    console.log("Commands:");
    console.log("\tadd\t\t\tAdd a new vault");
    console.log("\tlock\t\t\tLock a vault or vaults");
    console.log("\tremove\t\t\tRemove a vault");
    console.log("\tssh\t\t\tUse protected SSH keys");
    console.log("\tunlock\t\t\tUnlock a vault or vaults");
}

async function init() {
    markInstalledVersion();
    const argv: ArgV = minimist(process.argv.slice(2));
    // Check arguments
    if (argv.help || argv.h) {
        return help();
    } else if (argv.version || argv.v) {
        return version();
    } else if (argv._ && argv._.length > 0) {
        return routeCommand(argv);
    }
    noArgs();
}

function logo() {
    console.log("");
    console.log(boxen(
        chalk.bold.green(" Buttercup "),
        {
            padding: 0,
            borderStyle: boxen.BorderStyle.SingleDouble
        }
    ));
    console.log("");
}

function noArgs() {
    logo();
    console.log(`No arguments: Run ${chalk.bold("bcup --help")} for information on how to use this application.`);
    console.log("");
}

function routeCommand(argv: ArgV) {
    const [command] = argv._ || [];
    switch (command) {
        case "add":
            return addVault(argv);
        default:
            throw new Error(`Unknown command: ${command}`);
    }
}

function version() {
    console.log(packageInfo.version);
}

init().catch((err: Error) => {
    logError(err);
    process.exit(1);
});
