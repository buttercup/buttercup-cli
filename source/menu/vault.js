const fileExists = require("file-exists");
const { getInput, getPassword } = require("../library/input.js");
const { drawMenu } = require("./menu.js");
const { colourHighlight } = require("./misc.js");
const { extractTitleFromPath } = require("../library/file.js");
const { addLocalSource } = require("../buttercup/archiveManagement.js");

async function runNewLocalVault() {
    const fileName = await getInput("Vault filename: ");
    const targetExists = await fileExists(fileName);
    let isNew = false;
    if (!targetExists) {
        const action = await drawMenu(
            "That file doesn't exist - what would you like to do?",
            [
                { key: "n", text: "Create a new vault at this location" },
                { key: "l", text: "Enter a new local file path" },
                { key: "q", text: "Cancel and go back" }
            ]
        );
        if (action === "l") {
            return runNewLocalVault();
        } else if (action === "q") {
            return runVaultAccessMenu();
        }
        isNew = true;
    }
    const password = await getPassword(colourHighlight("Vault password: "));
    const title = await getInput("Title: ", [extractTitleFromPath(fileName)]);
    await addLocalSource(title, filename, password, isNew);
}

function runVaultAccessMenu() {
    const { runMainMenu } = require("./main.js");
    drawMenu(
        "Choose vault type to add:",
        [
            { key: "l", text: "Local file", cb: runNewLocalVault },
            { key: "q", text: "Quit / Back", cb: runMainMenu }
        ],
        {
            onFailure: err => {
                console.error(err);
                runVaultAccessMenu();
            }
        }
    );
}

module.exports = {
    runVaultAccessMenu
};
