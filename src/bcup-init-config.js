#!/user/bin/env node

var _fs = require("fs");

var program = require("commander");

var { defaultConfig, defaultConfigPath, log } = require("./utils");

program.parse(process.argv);

// look for an existing config file and create a new one if it doesn't exist
const initConfig = fs => {
  if (fs.existsSync(defaultConfigPath)) {
    log(`existing config file found at ${defaultConfigPath}`);
    return;
  }

  fs.writeFile(defaultConfigPath, JSON.stringify(defaultConfig, null, 2), () =>
    log(`new config generated at ${defaultConfigPath}`)
  );
};

if (require.main === module) {
  initConfig(_fs);
}

module.exports = {
  defaultConfig,
  initConfig
};
