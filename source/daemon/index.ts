#!/usr/bin/env node

import { daemonRunning } from "../client/request";
import { startDaemon } from "./app";
import { startShutdownTimer } from "./timer";
import { initialise as initialiseBcup } from "./buttercup/vaultMgmt";
import {
    DAEMON_EXIT_ALREADY_RUNNING,
    DAEMON_EXIT_NO_KEYS,
    DAEMON_EXIT_NO_TTL
} from "../symbols";

export async function boot() {
    checkEnv();
    // Check if running
    const alreadyRunning = await daemonRunning();
    if (alreadyRunning) {
        console.error("Already running");
        process.exit(DAEMON_EXIT_ALREADY_RUNNING);
    };
    // Bcup
    initialiseBcup();
    // Start
    await startDaemon();
    // Run shutdown timer
    startShutdownTimer(parseInt(process.env.TTL, 10));
}

function checkEnv() {
    const {
        PUBLIC_KEY,
        PRIVATE_KEY,
        TTL: TTL_RAW
    } = process.env;
    if (!PUBLIC_KEY || !PRIVATE_KEY) {
        console.error("No keys provided");
        process.exit(DAEMON_EXIT_NO_KEYS);
    } else if (!TTL_RAW || !/^\d+$/.test(TTL_RAW)) {
        console.error("Bad TTL");
        process.exit(DAEMON_EXIT_NO_TTL);
    }
}
