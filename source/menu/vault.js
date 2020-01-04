const fileExists = require("file-exists");
const ora = require("ora");
const expandHomeDir = require("expand-home-dir");
const boxen = require("boxen");
const { getInput, getPassword } = require("../library/input.js");
const { drawMenu } = require("./menu.js");
const { colourHighlight, styleVaultStatus } = require("./misc.js");
const { extractTitleFromPath } = require("../library/file.js");
const { addLocalSource, getSharedManager } = require("../buttercup/archiveManagement.js");

async function performLockSource(sourceID) {
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const spinner = ora(`Locking '${source.name}'`).start();
    try {
        await source.lock();
        spinner.succeed(`Locked '${source.name}'`);
    } catch (err) {
        spinner.fail(`Failed locking '${source.name}': ${err.message}`);
    }
    runVaultAccessMenu(sourceID);
}

async function performSaveSource(source) {
    const spinner = ora(`Saving '${source.name}'`).start();
    try {
        await source.workspace.save();
        spinner.succeed(`Saved '${source.name}'`);
    } catch (err) {
        spinner.fail(`Failed saving '${source.name}': ${err.message}`);
        throw err;
    }
}

async function performUnlockSource(sourceID) {
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const password = await getPassword(colourHighlight("Vault password: "));
    const spinner = ora(`Unlocking '${source.name}'`).start();
    try {
        await source.unlock(password);
        spinner.succeed(`Unlocked '${source.name}'`);
    } catch (err) {
        spinner.fail(`Failed unlocking '${source.name}': ${err.message}`);
    }
    runVaultAccessMenu(sourceID);
}

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

function runVaultAccessMenu(sourceID) {
    const { runMainMenu } = require("./main.js");
    const { runVaultContentsMenu } = require("./vaultContents.js");
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const isLocked = source.status !== "unlocked";
    console.log(boxen(`${source.name}\n${styleVaultStatus(isLocked)}`, {
        padding: {
            top: 0,
            bottom: 0,
            left: 1,
            right: 1
        },
        borderColor: "#ccc",
        borderStyle: "doubleSingle"
    }));
    const lockUnlockOptions = isLocked
        ? [{ key: "u", text: "Unlock vault", cb: () => performUnlockSource(sourceID) }]
        : [
            { key: "a", text: "Access vault contents", cb: () => runVaultContentsMenu(sourceID) },
            { key: "l", text: "Lock vault", cb: () => performLockSource(sourceID) }
        ];
    drawMenu(
        "Choose vault action:",
        [
            ...lockUnlockOptions,
            { key: "r", text: "Remove vault", cb: async () => {
                const choice = await drawMenu(
                    `Are you sure that you wish to remove '${source.name}'?`,
                    [
                        { key: "y", text: "Yes (remove)" },
                        { key: "n", text: "No / cancel" }
                    ]
                );
                if (choice !== "y") {
                    return runVaultAccessMenu(sourceID);
                }
                const spinner = ora("Removing source").start();
                try {
                    await archiveManager.removeSource(sourceID);
                    spinner.succeed("Successfully removed source");
                    return runMainMenu();
                } catch (err) {
                    spinner.fail(`Removing source failed: ${err.message}`);
                    return runVaultAccessMenu(sourceID);
                }
            } },
            { key: "q", text: "Quit / Back", cb: runMainMenu }
        ],
        {
            onFailure: err => {
                console.error(err);
                runVaultAccessMenu(sourceID);
            }
        }
    );
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
    performSaveSource,
    runVaultAccessMenu,
    runVaultAdditionMenu
};
