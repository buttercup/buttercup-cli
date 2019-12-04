const { ArchiveManager } = require("buttercup");
const LocalFileStorage = require("./LocalFileStorage.js");

let __archiveManager = null;

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
