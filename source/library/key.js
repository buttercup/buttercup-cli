const keypress = require("keypress");
const { hardQuit } = require("./process.js");

let __keypressListenerRegistered = false

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
            setTimeout(() => {
                resolve(key);
            }, 0);
        });
    });
}

function onKey(cb) {
    if (__keypressListenerRegistered) {
        throw new Error("Key-press listener already registered");
    }
    __keypressListenerRegistered = true;
    const isRaw = process.stdin.isRaw;
    let active = true;
    keypress(process.stdin);
    const onKeyPress = (ch, k) => {
        const key = sanitiseKey(ch, k);
        if (key.ctrl && key.name === "c") {
            hardQuit();
            return;
        }
        setTimeout(() => cb(key), 0);
    };
    const restore = () => {
        if (!active) {
            return;
        }
        active = false;
        process.stdin.setRawMode(isRaw);
        process.stdin.pause();
        // Keypress doesn't detach properly, so kill all listeners
        process.stdin.removeAllListeners();
        // Keypress doesn't re-initialise if the keypressDecoder is still present
        delete process.stdin._keypressDecoder;
        process.stdout.write("");
        __keypressListenerRegistered = false;
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
