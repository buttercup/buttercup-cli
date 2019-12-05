const { drawMenu } = require("./menu.js");

function runMainMenu() {
    drawMenu(
        "What would you like to do?",
        [
            { key: "n", text: "Add New Vault", cb: () => {} },
            { key: "q", text: "Quit", cb: () => {} }
        ]
    );
}

module.exports = {
    runMainMenu
};
