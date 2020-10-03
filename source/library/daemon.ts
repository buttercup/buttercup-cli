import fetch from "node-fetch";
import { DAEMON_PORT, DAEMON_REQUEST_TIMEOUT } from "../symbols";

export async function daemonRunning(): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:${DAEMON_PORT}/`, {
            timeout: DAEMON_REQUEST_TIMEOUT
        });
        if (response.ok) return true;
    } catch (err) {}
    return false;
}
