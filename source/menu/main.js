const { drawMenu } = require("./menu.js");

function runMainMenu() {
    const { runVaultAccessMenu } = require("./vault.js");
    drawMenu(
        "What would you like to do?",
        [
            { key: "n", text: "Add new vault", cb: runVaultAccessMenu },
            { key: "q", text: "Quit", cb: () => {
                console.log("Take care now, bye bye then!\n");
                process.exit(0);
            } }
        ]
    );
}

module.exports = {
    runMainMenu
};
