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
        const removeListener = onKey(key => {
            removeListener();
            resolve(key);
        });
    });
}

function onKey(cb) {
    const isRaw = process.stdin.isRaw;
    let active = true;
    keypress(process.stdin);
    const onKeyPress = (ch, k) => {
        const key = sanitiseKey(ch, k);
        if (key.ctrl && key.name === "c") {
            hardQuit();
        }
        setTimeout(() => cb(key), 0);
    };
    const restore = () => {
        if (!active) {
            return;
        }
        active = false;
        process.stdout.write("");
        process.stdin.setRawMode(isRaw);
        process.stdin.pause();
        process.stdin.removeListener("keypress", onKeyPress);
    };
    process.stdin.on("keypress", onKeyPress);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    return restore;
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
    getKey,
    onKey
};
