import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getKeys } from "../library/keys";
import { getMasterPassword } from "../library/password";
import { ArgVUnlock, DaemonCommand, DaemonResponseStatus, UnlockSourcePayload, UnlockSourceResponse, UUID } from "../types";

async function execute(payload: UnlockSourcePayload): Promise<UnlockSourceResponse> {
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.UnlockSource,
        payload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed unlocking vaults: ${response.error || "Unknown error"}`);
    }
    return response.payload as UnlockSourceResponse;
}

export async function unlock(argv: ArgVUnlock) {
    if (argv.id) {
        await unlockWithID(argv.id);
    } else if (typeof argv.index === "number" && argv.index >= 0) {
        await unlockWithIndex(argv.index);
    } else {
        throw new Error("No targets specified for unlocking");
    }
}

async function unlockWithID(id: UUID) {
    // Launch daemon
    await launchDaemon();
    // Get Password
    const masterPassword = await getMasterPassword();
    // Create request payload
    const payload: UnlockSourcePayload = {
        id,
        masterPassword
    };
    // Execute request
    const response = await execute(payload);
    console.log(response.vault.id);
}

async function unlockWithIndex(index: number) {
    // Launch daemon
    await launchDaemon();
    // Get Password
    const masterPassword = await getMasterPassword();
    // Create request payload
    const payload: UnlockSourcePayload = {
        index,
        masterPassword
    };
    // Execute request
    const response = await execute(payload);
    console.log(response.vault.id);
}
