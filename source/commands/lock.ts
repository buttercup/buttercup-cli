import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getKeys } from "../library/keys";
import { ArgVLock, DaemonCommand, DaemonResponseStatus, LockSourcesPayload, LockSourcesResponse, UUID } from "../types";

async function execute(payload: LockSourcesPayload): Promise<LockSourcesResponse> {
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.LockSources,
        payload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed locking vaults: ${response.error || "Unknown error"}`);
    }
    return response.payload as LockSourcesResponse;
}

export async function lock(argv: ArgVLock) {
    if (argv.all) {
        await lockAll();
    } else if (argv.id) {
        await lockWithID(argv.id);
    } else if (typeof argv.index === "number" && argv.index >= 0) {
        await lockWithIndex(argv.index);
    } else {
        throw new Error("No targets specified for locking");
    }
}

async function lockAll() {
    // Launch daemon
    await launchDaemon();
    // Create request payload
    const payload: LockSourcesPayload = {
        all: true
    };
    // Execute request
    const response = await execute(payload);
    console.log(response.lockedIDs.join("\n"));
}

async function lockWithID(id: UUID) {
    // Launch daemon
    await launchDaemon();
    // Create request payload
    const payload: LockSourcesPayload = {
        all: false,
        id
    };
    // Execute request
    const response = await execute(payload);
    console.log(response.lockedIDs.join("\n"));
}

async function lockWithIndex(index: number) {
    // Launch daemon
    await launchDaemon();
    // Create request payload
    const payload: LockSourcesPayload = {
        all: false,
        index
    };
    // Execute request
    const response = await execute(payload);
    console.log(response.lockedIDs.join("\n"));
}
