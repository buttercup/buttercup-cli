const chalk = require("chalk");

const pkg = require("../../package.json");

module.exports = function() {
    return `
    ____        __  __
   / __ )__  __/ /_/ /____  ____________  ______
  / __  / / / / __/ __/ _ \\/ ___/ ___/ / / / __ \\
 / /_/ / /_/ / /_/ /_/  __/ /  / /__/ /_/ / /_/ /
/_____/\\__,_/\\__/\\__/\\___/_/   \\___/\\__,_/ .___/
                                        /_/ ${chalk.dim(pkg.version)}
`;
};
