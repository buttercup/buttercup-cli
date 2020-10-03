import path from "path";
import childProcess from "child_process";
import fetch from "node-fetch";
import ms from "ms";
import { getDaemonTTL } from "../library/config";
import { generateKeyPair, storeKeys } from "../library/keys";
import { DAEMON_PORT, DAEMON_REQUEST_TIMEOUT } from "../symbols";

const WAIT_CHECK = 100;
const WAIT_MAX = 2000;

async function daemonRunning(): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:${DAEMON_PORT}/`, {
            timeout: DAEMON_REQUEST_TIMEOUT
        });
        if (response.ok) return true;
    } catch (err) {}
    return false;
}

export async function launchDaemon() {
    const running = await daemonRunning();
    if (running) return;
    // Prepare encryption/keys
    const keyPair = await generateKeyPair();
    await storeKeys(keyPair);
    // Prepare process
    const daemonScript = path.resolve(__dirname, "../daemon/index.js");
    const proc = childProcess.spawn(daemonScript, [], {
        detached: true,
        env: {
            PUBLIC_KEY: keyPair.public,
            PRIVATE_KEY: keyPair.private,
            TTL: ms(getDaemonTTL())
        },
        windowsHide: true
    });
    // Wait for daemon
    await waitForDaemon();
    // Detach
    proc.unref();
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
