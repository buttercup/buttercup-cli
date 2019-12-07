const figures = require("figures");
const { drawMenu } = require("./menu.js");
const { hardQuit } = require("../library/process.js");
const { getSharedManager } = require("../buttercup/archiveManagement.js");

const VAULT_HOTKEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function runMainMenu() {
    const { runVaultAccessMenu } = require("./vault.js");
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
                text: `${figures.pointer} ${source.name}`,
                cb: () => {
                    console.log(source);
                }
            })),
            { sep: true },
            { key: "n", text: "Add new vault", cb: runVaultAccessMenu },
            { key: "q", text: "Quit", cb: () => {
                hardQuit();
            } }
        ]
    );
}

module.exports = {
    runMainMenu
};
