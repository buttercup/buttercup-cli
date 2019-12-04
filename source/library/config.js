const path = require("path");
const ConfigStore = require("configstore");
const xdgBaseDir = require("xdg-basedir");
const pkgJson = require("../../package.json");

const CONFIG_DEFAULTS = {
    archiveManagementCache: path.join(xdgBaseDir.config, "buttercup-cli.archivemanagement.json")
};

let __config = null;

function getConfig() {
    return __config;
}

function initialiseConfig(configPathOverride) {
    if (__config) {
        throw new Error("Failed initialising: Config already initialised");
    }
    const options = {};
    if (typeof configPathOverride === "string") {
        options.configPath = configPathOverride;
    }
    __config = new ConfigStore(pkgJson.name, CONFIG_DEFAULTS, options);
}

module.exports = {
    getConfig,
    initialiseConfig
};
