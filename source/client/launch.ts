import path from "path";
import childProcess from "child_process";
import ms from "ms";
import { getDaemonTTL } from "../library/config";
import { generateKeyPair, storeKeys } from "../library/keys";
import { daemonRunning } from "./request";

const WAIT_CHECK = 100;
const WAIT_MAX = 2000;

export async function launchDaemon() {
    const running = await daemonRunning();
    if (running) return;
    // Prepare encryption/keys
    const keyPair = await generateKeyPair();
    await storeKeys(keyPair);
    // Prepare process
    const entry = path.resolve(__dirname, "../index.js");
    const proc = childProcess.spawn("node", [entry, "--daemon"], {
        detached: true,
        env: {
            PATH: process.env.PATH,
            PUBLIC_KEY: keyPair.public,
            PRIVATE_KEY: keyPair.private,
            TTL: ms(getDaemonTTL())
        },
        stdio: "inherit", // debugging
        windowsHide: true
    });
    // Detach
    proc.unref();
    // Wait for daemon
    await waitForDaemon();
}

async function waitForDaemon(startTime = Date.now()) {
    const running = await daemonRunning();
    if (running) return;
    const waitTime = Date.now() - startTime;
    if (waitTime > WAIT_MAX) {
        throw new Error(`Timed-out after ${WAIT_MAX}ms waiting for daemon to launch`);
    }
    await new Promise(resolve => {
        setTimeout(resolve, WAIT_CHECK);
    });
    await waitForDaemon(startTime);
}
