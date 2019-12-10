const figures = require("figures");
const { drawMenu } = require("./menu.js");
const { hardQuit } = require("../library/process.js");
const { getSharedManager } = require("../buttercup/archiveManagement.js");
const { styleVaultStatus } = require("./misc.js");

const VAULT_HOTKEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function runMainMenu() {
    const { runVaultAccessMenu, runVaultAdditionMenu } = require("./vault.js");
    const vaults = getSharedManager().sources
        .map((source, idx) => Object.assign(
            { hotkey: VAULT_HOTKEYS[idx] },
            source.description
        ))
        .filter(source => !!source.hotkey);
    drawMenu(
        "What would you like to do?",
        [
            ...vaults.map(source => ({
                key: source.hotkey,
                text: `${styleVaultStatus(source.status !== "unlocked", true)} ${source.name}`,
                cb: () => runVaultAccessMenu(source.id)
            })),
            { key: "n", text: "Add new vault", cb: runVaultAdditionMenu },
            { key: "q", text: "Quit", cb: () => {
                hardQuit();
            } }
        ],
        {
            onFailure: err => {
                console.error(err);
                runMainMenu();
            }
        }
    );
}

module.exports = {
    runMainMenu
};
