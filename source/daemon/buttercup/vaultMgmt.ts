import path from "path";
import {
    Credentials,
    VaultSource,
    VaultManager,
    init
} from "buttercup";
import { FileStorageInterface } from "./FileStorageInterface";
import { getConfigDirectory } from "../../library/config";
import { AddVaultPayload, DatasourceType, VaultDescription } from "../../types";

let __vaultManager: VaultManager;

export const initialise = init;

export async function addVault(payload: AddVaultPayload): Promise<VaultSource> {
    const { type, masterPassword, name, initialise } = payload;
    const manager = await getVaultManager();
    let source = null;
    if (type === DatasourceType.File) {
        const { path: vaultPath } = payload;
        const creds = Credentials.fromDatasource({
            type,
            path: vaultPath
        }, masterPassword);
        const credStr = await creds.toSecureString();
        source = new VaultSource(name, type, credStr);
        await manager.addSource(source);
        if (initialise) {
            await source.unlock(creds, {
                initialiseRemote: true
            });
        } else {
            await source.unlock(creds);
        }
    } else {
        throw new Error(`Invalid datasource type: ${type}`);
    }
    return source;
}

export async function getVaultManager(): Promise<VaultManager> {
    if (!__vaultManager) {
        const configDir = getConfigDirectory();
        const sourcesFile = path.join(configDir, "sources.json");
        const cacheFile = path.join(configDir, "cache.json");
        __vaultManager = new VaultManager({
            cacheStorage: new FileStorageInterface(cacheFile),
            sourceStorage: new FileStorageInterface(sourcesFile)
        });
        await __vaultManager.rehydrate();
    }
    return __vaultManager;
}

export async function getVaultsList(): Promise<Array<VaultDescription>> {
    const manager = await getVaultManager();
    return manager.sources.map((source: VaultSource) => ({
        id: source.id,
        name: source.name,
        order: source.order,
        status: source.status,
        type: source.type as DatasourceType
    }));
}
