const keypress = require("keypress");

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
        keypress(process.stdin);
        process.stdin.on("keypress", (ch, key) => {
            //console.log('got "keypress"', key);
            //if (key && key.ctrl && key.name == 'c') {
            process.stdin.pause();
            resolve(key);
            //}
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    });
}

module.exports = {
    getKey
};
