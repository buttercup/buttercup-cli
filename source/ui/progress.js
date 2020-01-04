const chalk = require("chalk");

function renderProgress(progress, options = {}) {
    const { padLine } = require("../library/format.js");
    const {
        progressLength = 10,
        background = " ",
        indicators: indicatorsRaw = "░▒▓",
        colourRatios = [0.1, 0.3]
    } = options;
    const indicators = Array.isArray(indicatorsRaw) ? indicatorsRaw : indicatorsRaw.split("");
    const progressIndicatorCount = indicators.length * progressLength;
    const ratio = (progress * progressIndicatorCount) / indicators.length;
    const fullIndicators = Math.floor(ratio);
    const singleIndicatorChar = indicators[Math.floor((ratio - fullIndicators) * indicators.length)];
    let progressBar = `${padLine("", fullIndicators, indicators[indicators.length - 1])}${fullIndicators === progressLength ? "" : singleIndicatorChar}${padLine("", progressLength - fullIndicators - 1, background)}`;
    if (Array.isArray(colourRatios)) {
        const [min, med] = colourRatios;
        if (progress > med) {
            progressBar = chalk.green(progressBar);
        } else if (progress > min && progress <= med) {
            progressBar = chalk.yellow(progressBar);
        } else if (progress <= min) {
            progressBar = chalk.red(progressBar);
        }
    }
    return progressBar;
}

// let prog = 1;
// console.log(`[${renderProgress(prog)}]`);
// setInterval(() => {
//     prog -= 0.02;
//     console.log(`[${renderProgress(prog)}]`);
// }, 1000);

module.exports = {
    renderProgress
};
