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
        const onKeyPress = (ch, key) => {
            restore();
            if (key.ctrl && key.name === "c") {
                hardQuit();
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

module.exports = {
    getKey
};
