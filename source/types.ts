import { VaultSourceID, VaultSourceStatus } from "buttercup";

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

export interface ArgVAddVault extends ArgV {
    name?: string;
    type?: DatasourceType
}

export interface ArgVList extends ArgV {
    _: ["vaults"];
    output?: "json" | "table";
}

export interface ArgVLock extends ArgV {
    all?: boolean;
    id?: UUID;
    index?: number;
}

export enum DaemonCommand {
    AddVault = "add-vault",
    ListSources = "list-sources",
    LockSources = "lock-sources",
    Shutdown = "shutdown"
}

export interface DaemonRequest {
    type: DaemonCommand;
    payload?: AddVaultPayload | ListSourcesPayload | LockSourcesPayload;
}

export interface DaemonResponse {
    error?: string;
    payload?: AddVaultResponse | ListSourcesResponse | LockSourcesResponse;
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

export interface RSAKeyPair {
    public: string;
    private: string;
}

export type UUID = string;

export interface VaultDescription {
    id: VaultSourceID;
    index: number;
    name: string;
    order: number;
    status: VaultSourceStatus;
    type: DatasourceType;
}
