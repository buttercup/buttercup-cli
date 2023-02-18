import { VaultSourceID } from "buttercup";
import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getKeys } from "../library/keys";
import { AddVaultPayload, AddVaultResponse, DaemonCommand, DaemonResponseStatus, ListSourcesPayload, ListSourcesResponse, VaultDescription } from "../types";

export async function addVault(requestPayload: AddVaultPayload): Promise<VaultSourceID> {
    // Launch daemon
    await launchDaemon();
    // Request addition
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.AddVault,
        payload: requestPayload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed adding vault: ${response.error || "Unknown error"}`);
    }
    const payload = response.payload as AddVaultResponse;
    // console.log(payload.sourceID);
    return payload.sourceID;
}

export async function getCurrentVaults(locked: boolean = true, unlocked: boolean = true): Promise<Array<VaultDescription>> {
    // Launch daemon
    await launchDaemon();
    // Request vaults
    const keys = await getKeys();
    const requestPayload: ListSourcesPayload = {
        locked,
        unlocked
    };
    const response = await sendMessage({
        type: DaemonCommand.ListSources,
        payload: requestPayload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed listing vaults: ${response.error || "Unknown error"}`);
    }
    const { sources } = (<ListSourcesResponse> response.payload);
    return sources;
}
