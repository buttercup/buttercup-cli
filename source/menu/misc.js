const chalk = require("chalk");
const figures = require("figures");
const pkgJson = require("../../package.json");
const { BUTTERCUP_COLOUR_RGB, FIGURE_COLOUR_RGB, LOCKED_COLOUR_RGB, OPTION_COLOUR_RGB, UNLOCKED_COLOUR_RGB } = require("../symbols.js");

const colourDim = txt => chalk.dim(txt);
const colourFigure = txt => chalk.rgb(...FIGURE_COLOUR_RGB)(txt);
const colourHighlight = txt => chalk.white(txt);
const colourOption = txt => chalk.rgb(...OPTION_COLOUR_RGB)(txt);
const colourPrimary = txt => chalk.rgb(...BUTTERCUP_COLOUR_RGB)(txt);
const styleVaultStatus = (isLocked, iconOnly = false) => isLocked
    ? chalk.rgb(...LOCKED_COLOUR_RGB)(`${figures.squareSmallFilled}${iconOnly ? "" : " Locked"}`)
    : chalk.rgb(...UNLOCKED_COLOUR_RGB)(`${figures.squareSmall}${iconOnly ? "" : " Unlocked"}`);;

function printButtercupWelcome() {
    // http://patorjk.com/software/taag/#p=display&f=Slant&t=Buttercup
    console.log(`${colourPrimary(`    ____        __  __
   / __ )__  __/ /_/ /____  ____________  ______
  / __  / / / / __/ __/ _ \\/ ___/ ___/ / / / __ \\
 / /_/ / /_/ / /_/ /_/  __/ /  / /__/ /_/ / /_/ /
/_____/\\__,_/\\__/\\__/\\___/_/   \\___/\\__,_/ .___/
                                        /_/`)}   v${colourHighlight(pkgJson.version)}`);
}

module.exports = {
    colourDim,
    colourFigure,
    colourHighlight,
    colourOption,
    colourPrimary,
    printButtercupWelcome,
    styleVaultStatus
};
