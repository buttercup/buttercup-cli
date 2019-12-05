const chalk = require("chalk");
const pkgJson = require("../../package.json");
const { BUTTERCUP_COLOUR_RGB } = require("../symbols.js");

function printButtercupWelcome() {
    // http://patorjk.com/software/taag/#p=display&f=Slant&t=Buttercup
    console.log(`${chalk.rgb(...BUTTERCUP_COLOUR_RGB)(`    ____        __  __
   / __ )__  __/ /_/ /____  ____________  ______
  / __  / / / / __/ __/ _ \\/ ___/ ___/ / / / __ \\
 / /_/ / /_/ / /_/ /_/  __/ /  / /__/ /_/ / /_/ /
/_____/\\__,_/\\__/\\__/\\___/_/   \\___/\\__,_/ .___/
                                        /_/`)}   v${chalk.white(pkgJson.version)}`);
}

module.exports = {
    printButtercupWelcome
};
