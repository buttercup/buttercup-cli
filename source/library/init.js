const { getConfig, initialiseConfig } = require("./config.js");
const { initialiseArchiveManager } = require("../buttercup/archiveManagement.js");

async function initialise(configPath = null) {
    initialiseConfig(configPath);
    const archiveManagementCachePath = getConfig().get("archiveManagementCache");
    await initialiseArchiveManager(archiveManagementCachePath);
}

module.exports = {
    initialise
};
