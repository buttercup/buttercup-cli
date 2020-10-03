export interface ArgV {
    _?: Array<string>;
    help?: boolean;
    version?: boolean;
    h?: boolean;
    v?: boolean;
}

export interface ArgVAddVault extends ArgV {
    type?: DatasourceType
}

export enum DatasourceType {
    File = "file",
    MyButtercup = "mybuttercup"
}

export interface RSAKeyPair {
    public: string;
    private: string;
}
