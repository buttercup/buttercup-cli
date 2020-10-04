#!/usr/bin/env node

import minimist from "minimist";
import chalk from "chalk";
import boxen from "boxen";
import { logError } from "./library/error";
import { markInstalledVersion } from "./library/config";
import { add as addVault } from "./commands/add";
import { list as listItems } from "./commands/list";
import { shutdown as shutdownDaemon } from "./client/shutdown";
import { boot as bootDaemon } from "./daemon/index";
import { daemonRunning } from "./client/request";
import { ArgV, ArgVAddVault, ArgVList } from "./types";
const packageInfo = require("../package.json");

const OFFLINE = chalk.red("OFFLINE");
const ONLINE = chalk.green("ONLINE ");

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
    console.log("\tshutdown\t\tShutdown the Daemon, if running");
    console.log("\tssh\t\t\tUse protected SSH keys");
    console.log("\tunlock\t\t\tUnlock a vault or vaults");
}

async function init() {
    markInstalledVersion();
    const argv: ArgV = minimist(process.argv.slice(2));
    // Check arguments
    if (argv.daemon) {
        return bootDaemon();
    }
    if (argv.help || argv.h) {
        return help();
    } else if (argv.version || argv.v) {
        return version();
    } else if (argv._ && argv._.length > 0) {
        return routeCommand(argv);
    }
    await noArgs();
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

async function noArgs() {
    logo();
    await status();
    console.log(`No arguments: Run ${chalk.bold("bcup --help")} for information on how to use this application.`);
    console.log("");
}

async function routeCommand(argv: ArgV) {
    argv._ = argv._ || [];
    const [command] = argv._;
    argv._.shift();
    switch (command) {
        case "add":
            return addVault(argv as ArgVAddVault);
        case "list":
            return listItems(argv as ArgVList);
        case "shutdown":
            return shutdownDaemon();
        default:
            throw new Error(`Unknown command: ${command}`);
    }
}

async function status() {
    const daemonAlive = await daemonRunning();
    console.log("Status:")
    console.log("\tDaemon\t\t\t", `[${daemonAlive ? ONLINE : OFFLINE}]`);
    console.log();
}

function version() {
    console.log(packageInfo.version);
}

init().catch((err: Error) => {
    logError(err);
    process.exit(1);
});
