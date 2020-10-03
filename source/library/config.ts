import path from "path";
import ConfigStore from "configstore";
import userHome from "user-home";
import { CONFIG_PACKAGE_NAME } from "../symbols";
const packageInfo = require("../../package.json");

const CONFIG_DEFAULTS = {
    daemon: {
        ttl: "10m"
    }
};

let __config: ConfigStore;

function getConfig(): ConfigStore {
    if (!__config) {
        __config = new ConfigStore(CONFIG_PACKAGE_NAME, CONFIG_DEFAULTS);
    }
    return __config;
}

export function getConfigDirectory(): string {
    return path.join(userHome, ".buttercup/cli");
}

export function getDaemonTTL(): string {
    return getConfig().get("daemon.ttl");
}

export function markInstalledVersion() {
    const { version } = packageInfo;
    const config = getConfig();
    if (!config.get("installed.version")) {
        config.set("installed.version", version);
        config.set("installed.date", (new Date()).toISOString());
    }
}
