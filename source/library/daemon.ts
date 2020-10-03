import fetch from "node-fetch";
import { decryptContent, encryptContent } from "./encryption";
import { DAEMON_PORT, DAEMON_REQUEST_TIMEOUT } from "../symbols";
import { DaemonRequest, DaemonResponse, RSAKeyPair } from "../types";

const API = `http://localhost:${DAEMON_PORT}/`;

export async function daemonRunning(): Promise<boolean> {
    try {
        const response = await fetch(API, {
            timeout: DAEMON_REQUEST_TIMEOUT
        });
        if (response.ok) return true;
    } catch (err) {}
    return false;
}

export async function sendMessage(request: DaemonRequest, keys: RSAKeyPair): Promise<DaemonResponse> {
    const encrypted = await encryptContent(JSON.stringify(request), keys);
    const response = await fetch(API, {
        method: "POST",
        timeout: DAEMON_REQUEST_TIMEOUT,
        headers: {
            "Content-Type": "text/plain"
        },
        body: encrypted
    });
    if (!response.ok) {
        throw new Error(`Bad response from Daemon: ${response.status} ${response.statusText}`);
    }
    const decrypted = await decryptContent(response.body, keys);
    return JSON.parse(decrypted) as DaemonResponse;
}
