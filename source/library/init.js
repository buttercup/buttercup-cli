const { getConfig, initialiseConfig } = require("./config.js");
const { initialiseArchiveManager } = require("../buttercup/archiveManagement.js");

function initialise(configPath = null) {
    initialiseConfig(configPath);
    const archiveManagementCachePath = getConfig().get("archiveManagementCache");
    initialiseArchiveManager(archiveManagementCachePath);
}

module.exports = {
    initialise
};
