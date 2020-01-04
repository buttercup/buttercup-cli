const autoComplete = require("autocomplete-cli");
const pw = require("pw");
const sleep = require("sleep-promise");

async function editInput(prompt, value = "", allowEmpty = true) {
    const { colourDim, colourHighlight } = require("../menu/misc.js");
    const { drawMenu } = require("../menu/menu.js");
    console.log(`${colourHighlight("Current value:")} ${value}`);
    const emptyMessage = allowEmpty ? "Empty value prompts to cancel" : "Empty value cancels";
    const newValue = await getInput(`${colourDim(`(${emptyMessage})`)} ${prompt}`);
    if (newValue === "") {
        if (!allowEmpty) {
            return null;
        }
        const action = await drawMenu(
            "Empty value entered - what would you like to do?",
            [
                { key: "s", text: "Save this empty value" },
                { key: "c", text: "Cancel value change" }
            ]
        );
        if (action === "c") {
            return null;
        }
    } else if (!newValue) {
        throw new Error(`Value must be a string: ${typeof newValue} received`);
    }
    return newValue;
}

function getInput(prompt, suggestions = []) {
    return autoComplete({ start: prompt, suggestions: new Set([...suggestions]) })
        .then(value =>
            sleep(50).then(() => {
                console.log("");
                return value;
            })
        );
}

async function getPassword(prompt) {
    await sleep(50);
    process.stdout.write(prompt);
    return new Promise((resolve, reject) => {
        pw("", password => {
            if (!password) {
                return reject(new Error("Empty password entered"));
            }
            resolve(password);
        });
    });
}

module.exports = {
    editInput,
    getInput,
    getPassword
};
