const { drawMenu } = require("./menu.js");

function runVaultAccessMenu() {
    const { runMainMenu } = require("./main.js");
    drawMenu(
        "Choose vault type to add:",
        [
            { key: "l", text: "Local file", cb: () => {} },
            { key: "q", text: "Quit / Back", cb: runMainMenu }
        ]
    );
}

module.exports = {
    runVaultAccessMenu
};
