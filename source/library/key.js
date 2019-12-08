const keypress = require("keypress");
const { hardQuit } = require("./process.js");

/**
 * @typedef {Object} Key
 * @property {String} name The key name/type
 * @property {Boolean} ctrl Whether CTRL was pressed or not
 * @property {Boolean} meta ?
 * @property {Boolean} shift Whether SHIFT was pressed or not
 */

/**
 * Get a key-press
 * @returns {Promise.<Key>}
 */
function getKey() {
    return new Promise(resolve => {
        const isRaw = process.stdin.isRaw;
        keypress(process.stdin);
        const onKeyPress = (ch, k) => {
            const key = sanitiseKey(ch, k);
            // if (key.ctrl && key.name === "z") {
            //     process.emit("SIGTSTP");
            //     return;
            // }
            restore();
            if (key.ctrl && key.name === "c") {
                hardQuit();
                return;
            }
            resolve(key);
        };
        const restore = () => {
            process.stdout.write("");
            process.stdin.setRawMode(isRaw);
            process.stdin.pause();
            process.stdin.off("keypress", onKeyPress);
        };
        process.stdin.on("keypress", onKeyPress);
        process.stdin.setRawMode(true);
        process.stdin.resume();
    });
}

function sanitiseKey(ch, key) {
    if (!key) {
        return {
            name: `${ch}`,
            ctrl: false,
            meta: false,
            shift: false
        };
    }
    return key;
}

module.exports = {
    getKey
};
