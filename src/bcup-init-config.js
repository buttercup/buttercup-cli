#!/user/bin/env node

var fs = require("fs");

var program = require("commander");

var { defaultConfig, defaultConfigPath, log } = require("./utils");

program.parse(process.argv);

// look for an existing config file and create a new one if it doesn't exist
const initConfig = _fs => {
  if (_fs.existsSync(defaultConfigPath)) {
    log(`existing config file found at ${defaultConfigPath}`);
    return;
  }

  _fs.writeFile(defaultConfigPath, JSON.stringify(defaultConfig, null, 2), () =>
    log(`new config generated at ${defaultConfigPath}`)
  );
};

if (require.main === module) {
  initConfig(fs);
}

module.exports = {
  defaultConfig,
  initConfig
};
