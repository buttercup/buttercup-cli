import { VaultFacade, VaultSourceID, VaultSourceStatus } from "buttercup";

export interface AddVaultPayload {
    initialise?: boolean;
    masterPassword: string;
    name: string;
    path?: string;
    type: DatasourceType;
}

export interface AddVaultResponse {
    sourceID: string;
}

export interface ArgV {
    _?: Array<string>;
    daemon?: boolean;
    help?: boolean;
    verbose?: boolean;
    version?: boolean;
    h?: boolean;
    v?: boolean;
}

export interface ArgVAdd extends ArgV {
    _: ["vaults" | "vault", Filename?];
    name?: string;
    type?: DatasourceType;
}

export interface ArgVList extends ArgV {
    _: ["groups" | "group" | "vaults" | "vault"];
    id?: UUID;
    index?: number;
    output?: "json" | "table" | "tree";
}

export interface ArgVLock extends ArgV {
    all?: boolean;
    id?: UUID;
    index?: number;
}

export interface ArgVRemove extends ArgV {
    _: ["vault" | "vaults"];
    all?: boolean;
    id?: string;
    index?: number;
}

export interface ArgVUnlock extends ArgV {
    id?: UUID;
    index?: number;
}

export enum DaemonCommand {
    AddVault = "add-vault",
    GetVaultContents = "vault-contents",
    ListSources = "list-sources",
    LockSources = "lock-sources",
    RemoveSources = "remove-sources",
    Shutdown = "shutdown",
    UnlockSource = "unlock-source"
}

export interface DaemonRequest {
    type: DaemonCommand;
    payload?: AddVaultPayload | ListSourcesPayload | LockSourcesPayload | RemoveSourcesPayload | UnlockSourcePayload;
}

export interface DaemonResponse {
    error?: string;
    payload?: AddVaultResponse | ListSourcesResponse | LockSourcesResponse | RemoveSourcesResponse | UnlockSourceResponse;
    status: DaemonResponseStatus;
}

export enum DaemonResponseStatus {
    Error = "error",
    OK = "ok"
}

export enum DatasourceType {
    File = "file",
    MyButtercup = "mybuttercup"
}

export type Filename = string;

// export interface ListGroupsPayload {
//     id?: UUID;
//     index?: number;
// }

// export interface ListGroupsResponse {

// }

export interface ListSourcesPayload {
    locked: boolean;
    unlocked: boolean;
}

export interface ListSourcesResponse {
    sources: Array<VaultDescription>;
}

export interface LockSourcesPayload {
    all: boolean;
    id?: UUID;
    index?: number;
}

export interface LockSourcesResponse {
    lockedIDs: Array<UUID>;
    lockedIndexes: Array<number>;
}

export interface RemoveSourcesPayload {
    all: boolean;
    id?: VaultSourceID;
    index?: number;
}

export interface RemoveSourcesResponse {
    removedIDs: Array<UUID>;
}

export interface RSAKeyPair {
    public: string;
    private: string;
}

export interface UnlockSourcePayload {
    id?: UUID;
    index?: number;
    masterPassword?: string;
}

export interface UnlockSourceResponse {
    vault: VaultDescription;
}

export type UUID = string;

export interface VaultContentsPayload {
    id?: UUID;
    index?: number;
}

export interface VaultContentsResponse {
    vault: VaultFacade;
}

export interface VaultDescription {
    id: VaultSourceID;
    index: number;
    name: string;
    order: number;
    status: VaultSourceStatus;
    type: DatasourceType;
}
