const { drawMenu } = require("./menu.js");
const { hardQuit } = require("../library/process.js");

function runMainMenu() {
    const { runVaultAccessMenu } = require("./vault.js");
    drawMenu(
        "What would you like to do?",
        [
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
