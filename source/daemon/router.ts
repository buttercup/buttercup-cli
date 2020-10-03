import { getKeys } from "../library/keys";
import { encryptContent } from "../library/encryption";
import { stopDaemon } from "./app";
import { renewTimer, stopTimer } from "./timer";
import { addVault } from "./buttercup/vaultMgmt";
import { AddVaultResponse, DaemonCommand, DaemonRequest, DaemonResponse, DaemonResponseStatus } from "../types";

export async function handleCommand(req, res) {
    const payload: DaemonRequest = req.body;
    const resp = await routeCommand(payload);
    const keys = await getKeys();
    const encrypted = await encryptContent(JSON.stringify(resp), keys);
    res
        .status(200)
        .set("Content-Type", "text/plain")
        .send(encrypted);
}

async function routeCommand(request: DaemonRequest): Promise<DaemonResponse> {
    renewTimer();
    switch (request.type) {
        case DaemonCommand.AddVault: {
            const source = await addVault(request.payload);
            const resp: AddVaultResponse = {
                sourceID: source.id
            };
            return {
                status: DaemonResponseStatus.OK,
                payload: resp
            };
        }
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
                error: `Invalid command: ${request.type}`
            };
    }
}
