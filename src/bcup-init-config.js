#!/user/bin/env node

var program = require("commander");

var _fs = require("fs");
var os = require("os");

var { defaultConfig, log } = require("./utils");

program.parse(process.argv);

const configPath = `${os.homedir()}/.buttercup.json`;

// look for an existing config file and create a new one if it doesn't exist
const initConfig = fs => {
  if (fs.existsSync(configPath)) {
    log(`existing config file found at ${configPath}`);
    return;
  }

  fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), () =>
    log(`new config generated at ${configPath}`)
  );
};

if (require.main === module) {
  initConfig(_fs);
}

module.exports = {
  defaultConfig,
  initConfig
};
