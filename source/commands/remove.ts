import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getKeys } from "../library/keys";
import { ArgVRemove, DaemonCommand, DaemonResponseStatus, RemoveSourcesPayload, RemoveSourcesResponse } from "../types";

export async function remove(argv: ArgVRemove) {
    const [type] = argv._;
    switch (type) {
        case "vault":
            /* falls-through */
        case "vaults":
            return removeSources(argv);
        default:
            throw new Error(`Invalid list type: ${type}`);
    }
}

async function removeSources(argv: ArgVRemove) {
    const {
        all,
        id,
        index
    } = argv;
    // Launch daemon
    await launchDaemon();
    // Request removal
    const requestPayload: RemoveSourcesPayload = {
        all: !!all,
        id,
        index
    };
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.RemoveSources,
        payload: requestPayload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed removing vault sources: ${response.error || "Unknown error"}`);
    }
    const { removedIDs } = (<RemoveSourcesResponse> response.payload);
    removedIDs.forEach(id => {
        console.log(id);
    });
}
