const { ArchiveManager, ArchiveSource, Credentials } = require("buttercup");
const LocalFileStorage = require("./LocalFileStorage.js");

let __archiveManager = null;

async function addLocalSource(title, filename, password, createNew = false) {
    const archiveCredentials = Credentials.fromPassword(password);
    const sourceCredentials = new Credentials("file");
    sourceCredentials.setValue("datasource", {
        type: "file",
        path: filename
    });
    const archiveCredsEnc = await archiveCredentials.toSecureString(password);
    const sourceCredsEnc = await sourceCredentials.toSecureString(password);
    const archiveManager = getSharedManager();
    const source = new ArchiveSource(title, sourceCredsEnc, archiveCredsEnc, { type: "file" });
    await archiveManager.interruptAutoUpdate(() =>
        archiveManager
            .addSource(source)
            .then(() => source.unlock(password, createNew))
            .then(() => archiveManager.dehydrateSource(source))
    );
}

function getSharedManager() {
    return __archiveManager;
}

function initialiseArchiveManager(storageFilename) {
    if (__archiveManager) {
        throw new Error("Failed initialising: Archive manager instance already exists");
    }
    __archiveManager = new ArchiveManager(new LocalFileStorage(storageFilename));
}

module.exports = {
    getSharedManager,
    initialiseArchiveManager
};
