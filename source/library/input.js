const autoComplete = require("autocomplete-cli");
const pw = require("pw");
const sleep = require("sleep-promise");

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
    getInput,
    getPassword
};
