export interface AddVaultPayload {
    initialise?: boolean;
    masterPassword: string;
    name: string;
    path?: string;
    type: DatasourceType;
}

export interface ArgV {
    _?: Array<string>;
    daemon?: boolean;
    help?: boolean;
    version?: boolean;
    h?: boolean;
    v?: boolean;
}

export interface ArgVAddVault extends ArgV {
    name?: string;
    type?: DatasourceType
}

export enum DaemonCommand {
    Shutdown = "shutdown"
}

export interface DaemonRequest {
    type: DaemonCommand;
    payload?: AddVaultPayload;
}

export interface DaemonResponse {
    error?: string;
    payload?: Object;
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

export interface RSAKeyPair {
    public: string;
    private: string;
}
