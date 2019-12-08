const figures = require("figures");
const sleep = require("sleep-promise");
const { colourDim, colourFigure, colourHighlight, colourOption, colourPrimary } = require("./misc.js");
const { getKey } = require("../library/key.js");

const NOOP = () => {};

/**
 * @typedef {Object} MenuOption
 * @property {String} key The key to listen for
 * @property {String} text The text to display for the option
 * @property {Function=} cb Optional callback for the menu option
 *  (optional - key is also returned asynchronously)
 */

/**
 * @typedef {Object} DrawMenuOptions
 * @property {Function=} onFailure - On-error callback for if a
 *  menu item callback fails
 */

/**
 * Create and display a menu
 * @param {String} prompt The menu prompt text
 * @param {MenuOption[]} options Non-empty array of menu options
 * @param {DrawMenuOptions=} config Optional configuration for
 *  the menu
 * @returns {Promise.<String>} A promise resolving with the
 *  pressed key name
 * @throws {Error} Throws if options is empty
 */
async function drawMenu(prompt, options, config = {}) {
    const { onFailure = NOOP } = config;
    try {
        console.log(`${colourFigure(figures.play)} ${colourHighlight(prompt)}`);
        if (!options || options.length <= 0) {
            throw new Error("No options for menu");
        }
        options.forEach(option => {
            const { text, key } = option;
            console.log(`   ${colourOption(key + ".")} ${text}`);
        });
        await sleep(50);
        process.stdout.write(`${colourDim(figures.questionMarkPrefix)} `);
        let targetOption = null;
        while (!targetOption) {
            const pressedKey = await getKey();
            targetOption = options.find(opt => opt.key === pressedKey.name) || null;
            if (targetOption) {
                console.log(colourPrimary(pressedKey.name) + "\n");
            }
        }
        (targetOption.cb || NOOP)();
        return targetOption.key;
    } catch (err) {
        onFailure(err);
    }
}

module.exports = {
    drawMenu
};
