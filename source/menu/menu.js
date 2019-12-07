const figures = require("figures");
const sleep = require("sleep-promise");
const { colourDim, colourFigure, colourHighlight, colourOption, colourPrimary } = require("./misc.js");
const { getKey } = require("../library/key.js");

const NOOP = () => {};

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
