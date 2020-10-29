import { getKeys } from "../library/keys";
import { encryptContent } from "../library/encryption";
import { stopDaemon } from "./app";
import { renewTimer, stopTimer } from "./timer";
import {
    addVault,
    getSourceAtIndex,
    getVaultFacade,
    getVaultsList,
    getVaultManager,
    lockAllVaults,
    lockVaults,
    removeAllVaults,
    removeVault,
    unlockVault
} from "./buttercup/vaultMgmt";
import {
    AddVaultPayload,
    AddVaultResponse,
    DaemonCommand,
    DaemonRequest,
    DaemonResponse,
    DaemonResponseStatus,
    ListSourcesResponse,
    LockSourcesPayload,
    RemoveSourcesPayload,
    UnlockSourcePayload,
    VaultContentsPayload,
    VaultContentsResponse,
    VaultDescription
} from "../types";

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
        case DaemonCommand.GetVaultContents: {
            const { id, index } = request.payload as VaultContentsPayload;
            let facade;
            if (id) {
                const manager = await getVaultManager();
                const source = manager.getSourceForID(id);
                facade = await getVaultFacade(source);
            } else if (typeof index === "number" && index >= 0) {
                const source = await getSourceAtIndex(index);
                facade = await getVaultFacade(source);
            } else {
                return {
                    status: DaemonResponseStatus.Error,
                    error: "No target specified for locking"
                };
            }
            return {
                status: DaemonResponseStatus.OK,
                payload: {
                    vault: facade
                } as VaultContentsResponse
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
        case DaemonCommand.LockSources: {
            const { all, id, index } = request.payload as LockSourcesPayload;
            let items: Array<VaultDescription>;
            if (all) {
                items = await lockAllVaults();
            } else if (id) {
                items = await lockVaults([id]);
            } else if (typeof index === "number" && index >= 0) {
                const source = await getSourceAtIndex(index);
                items = await lockVaults([source.id]);
            } else {
                return {
                    status: DaemonResponseStatus.Error,
                    error: "No target specified for locking"
                };
            }
            return {
                status: DaemonResponseStatus.OK,
                payload: {
                    lockedIDs: items.map(item => item.id),
                    lockedIndexes: items.map(item => item.index)
                }
            };
        }
        case DaemonCommand.RemoveSources: {
            const { all, id, index } = request.payload as RemoveSourcesPayload;
            let items: Array<VaultDescription>;
            if (all) {
                items = await removeAllVaults();
            } else if (id) {
                const item = await removeVault(id);
                items = [item];
            } else if (typeof index === "number" && index >= 0) {
                const source = await getSourceAtIndex(index);
                const item = await removeVault(source.id);
                items = [item];
            } else {
                return {
                    status: DaemonResponseStatus.Error,
                    error: "No target specified for removal"
                };
            }
            return {
                status: DaemonResponseStatus.OK,
                payload: {
                    removedIDs: items.map(item => item.id)
                }
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
        case DaemonCommand.UnlockSource: {
            const { id, index, masterPassword = null } = request.payload as UnlockSourcePayload;
            let vault: VaultDescription;
            if (id) {
                vault = await unlockVault(id, masterPassword);
            } else if (typeof index === "number" && index >= 0) {
                const source = await getSourceAtIndex(index);
                vault = await unlockVault(source.id, masterPassword);
            } else {
                return {
                    status: DaemonResponseStatus.Error,
                    error: "No target specified for locking"
                };
            }
            return {
                status: DaemonResponseStatus.OK,
                payload: {
                    vault
                }
            };
        }
        default:
            return {
                status: DaemonResponseStatus.Error,
                error: `Invalid command: ${request.type}`
            };
    }
}
