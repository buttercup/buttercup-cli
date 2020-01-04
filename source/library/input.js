// const readLine = require("readline");
// const { Transform: RWStreamBase } = require("stream");
const autoComplete = require("autocomplete-cli");
const pw = require("pw");
const sleep = require("sleep-promise");

// class RWStream extends RWStreamBase {
//     _transform(chunk, encoding, callback) {
//         this.push(chunk);
//         callback();
//     }
// }

async function editInput(prompt, value = "") {
    const { colourDim, colourHighlight } = require("../menu/misc.js");
    const { drawMenu } = require("../menu/menu.js");
    console.log(`${colourHighlight("Current value:")} ${value}`);
    const newValue = await getInput(`${colourDim("(Empty value prompts to cancel)")} ${prompt}`);
    if (newValue === "") {
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
    // const ds = new RWStream();
    // const rl = readLine.createInterface({
    //     input: ds,
    //     // input: process.stdin,
    //     output: process.stdout,
    //     terminal: true
    // });
    // process.stdin.pipe(ds);
    // const result = await new Promise(resolve => {
    //     rl.question(prompt, userInput => {
    //         rl.close();
    //         process.stdin.pause();
    //         ds.destroy();
    //         resolve(userInput);
    //     });
    //     if (value) {
    //         setTimeout(() => {
    //             // rl.line = value;
    //             // rl.cursor = rl.line.length;
    //             // rl._refreshLine();
    //             ds.write(value, "utf8");
    //         }, 5);
    //     }
    //     // ds.write(value, "utf8");
    // });
    // return result;
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
