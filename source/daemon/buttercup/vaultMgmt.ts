import path from "path";
import {
    Credentials,
    VaultFacade,
    VaultSource,
    VaultSourceStatus,
    VaultManager,
    createVaultFacade,
    init
} from "buttercup";
import { FileStorageInterface } from "./FileStorageInterface";
import { getConfigDirectory } from "../../library/config";
import { AddVaultPayload, DatasourceType, UUID, VaultDescription } from "../../types";

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

export async function getSourceAtIndex(index: number): Promise<VaultSource> {
    const manager = await getVaultManager();
    return manager.sources[index] || null;
}

export async function getVaultFacade(source: VaultSource): Promise<VaultFacade> {
    if (source.status !== VaultSourceStatus.Unlocked) {
        throw new Error(`Source not unlocked: ${source.id}`);
    }
    return createVaultFacade(source.vault);
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
    return manager.sources.map((source: VaultSource) => sourceToDescription(source, manager.sources));
}

export async function lockAllVaults(): Promise<Array<VaultDescription>> {
    const manager = await getVaultManager();
    const unlocked = manager.unlockedSources;
    await Promise.all(unlocked.map((source: VaultSource) => source.lock()));
    return unlocked.map((source: VaultSource) => sourceToDescription(source, manager.sources));
}

export async function lockVaults(ids: Array<UUID>): Promise<Array<VaultDescription>> {
    const manager = await getVaultManager();
    const targets = ids.reduce((sources, nextID) => {
        const source = manager.getSourceForID(nextID);
        if (source) sources.push(source);
        return sources;
    }, []);
    return targets.map((source: VaultSource) => sourceToDescription(source, manager.sources));
}

function sourceToDescription(source: VaultSource, sources: Array<VaultSource>): VaultDescription {
    return {
        id: source.id,
        index: sources.findIndex(item => item.id === source.id),
        name: source.name,
        order: source.order,
        status: source.status,
        type: source.type as DatasourceType
    };
}

export async function unlockVault(id: UUID, masterPassword: string): Promise<VaultDescription> {
    if (!masterPassword) {
        throw new Error("Cannot unlock: No password provided");
    }
    const manager = await getVaultManager();
    const source = manager.getSourceForID(id);
    if (source.status === VaultSourceStatus.Unlocked) {
        throw new Error(`Vault is already unlocked: ${id}`);
    }
    await source.unlock(Credentials.fromPassword(masterPassword));
    return sourceToDescription(source, manager.sources);
}
