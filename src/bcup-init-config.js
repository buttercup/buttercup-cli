#!/user/bin/env node

var program = require("commander");

var fs = require("fs");
var os = require("os");

var { log } = require("./utils");

program.parse(process.argv);

const configPath = `${os.homedir()}/.buttercup.json`;

// this is the default config structure, the user is meant to edit their
// configs by hand
const defaultConfig = {
  archives: [
    {
      name: "example archive",
      path: "/path/to/archive"
    }
  ]
};

// look for an existing config file and create a new one if it doesn't exist
const initConfig = () => {
  if (fs.existsSync(configPath)) {
    log(`existing config file found at ${configPath}`);
    return;
  }

  fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), () =>
    log(`new config generated at ${configPath}`)
  );
};

initConfig();
