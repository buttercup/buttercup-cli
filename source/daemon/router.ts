import { getKeys } from "../library/keys";
import { encryptContent } from "../library/encryption";
import { stopDaemon } from "./app";
import { renewTimer, stopTimer } from "./timer";
import { addVault, getVaultsList } from "./buttercup/vaultMgmt";
import { AddVaultPayload, AddVaultResponse, DaemonCommand, DaemonRequest, DaemonResponse, DaemonResponseStatus, ListSourcesResponse } from "../types";

export async function handleCommand(req, res) {
    const payload: DaemonRequest = req.body;
    let resp;
    try {
        resp = await routeCommand(payload);
    } catch (err) {
        resp = {
            status: DaemonResponseStatus.Error,
            error: `Command failed: ${err.message}`
        };
    }
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
            const source = await addVault(request.payload as AddVaultPayload);
            const resp: AddVaultResponse = {
                sourceID: source.id
            };
            return {
                status: DaemonResponseStatus.OK,
                payload: resp
            };
        }
        case DaemonCommand.ListSources: {
            const sources = await getVaultsList();
            const resp: ListSourcesResponse = { sources };
            return {
                status: DaemonResponseStatus.OK,
                payload: resp
            };
        }
        case DaemonCommand.RemoveSources: {
            // @todo
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
