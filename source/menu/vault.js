const fileExists = require("file-exists");
const ora = require("ora");
const expandHomeDir = require("expand-home-dir");
const { getInput, getPassword } = require("../library/input.js");
const { drawMenu } = require("./menu.js");
const { colourHighlight } = require("./misc.js");
const { extractTitleFromPath } = require("../library/file.js");
const { addLocalSource } = require("../buttercup/archiveManagement.js");

async function runNewLocalVault() {
    const { runMainMenu } = require("./main.js");
    const fileNameRaw = await getInput("Vault filename: ");
    const fileName = expandHomeDir(fileNameRaw);
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
            return runVaultAdditionMenu();
        }
        isNew = true;
    }
    const password = await getPassword(colourHighlight("Vault password: "));
    const title = await getInput("Title: ", [extractTitleFromPath(fileName)]);
    const spinner = ora("Adding source").start();
    try {
        await addLocalSource(title, fileName, password, isNew);
        spinner.succeed("Successfully added source");
        runMainMenu();
    } catch (err) {
        spinner.fail(`Adding source failed: ${err.message}`);
        runVaultAdditionMenu();
    }
}

function runVaultAdditionMenu() {
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
                runVaultAdditionMenu();
            }
        }
    );
}

module.exports = {
    runVaultAdditionMenu
};
