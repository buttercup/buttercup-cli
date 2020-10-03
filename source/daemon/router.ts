import { getKeys } from "../library/keys";
import { encryptContent } from "../library/encryption";
import { stopDaemon } from "./app";
import { stopTimer } from "./timer";
import { DaemonCommand, DaemonRequest, DaemonResponse, DaemonResponseStatus } from "../types";

export async function handleCommand(req, res) {
    const payload: DaemonRequest = req.body;
    const resp = await routeCommand(payload);
    const keys = await getKeys();
    const encrypted = await encryptContent(JSON.stringify(resp), keys);
    res
        .status(200)
        .set("Content-Type", "text")
        .send(encrypted);
}

async function routeCommand(payload: DaemonRequest): Promise<DaemonResponse> {
    switch (payload.type) {
        case DaemonCommand.Shutdown:
            setTimeout(() => {
                stopDaemon();
                stopTimer();
            }, 250);
            return {
                status: DaemonResponseStatus.OK
            };
        default:
            return {
                status: DaemonResponseStatus.Error,
                error: `Invalid command: ${payload.type}`
            };
    }
}
