const { drawMenu } = require("./menu.js");

function runMainMenu() {
    drawMenu(
        "What would you like to do?",
        [
            { key: "n", text: "Add New Vault", cb: () => {} },
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
