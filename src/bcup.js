#!/usr/bin/env node

var fs = require("fs");

var program = require("commander");

var { defaultConfigPath, getConfig } = require("./utils");

program.configPath = defaultConfigPath;

program
  .version("0.0.1", "-v, --version")
  .option("-c --config [file]", "Use a specific config file");

program
  .command("init-config [path]", "initialize a config file")
  .command("ls", "list all secrets")
  .command("new", "make a new secret")
  .command("show", "display a secret in the terminal")
  .command("copy", "copy a secret to the clipboard")
  .command("unlock", "unlock an archive")
  .command("lock", "lock an archive");

program.parse(process.argv);

const main = p => {
  // get and parse the config file, the command executables will be run
  // after this
  let c;
  switch (true) {
    case !!p.config: // if config option is truthy
      c = getConfig(fs, p.config);
      if (!c) return;

      p.parsedConfig = c;
      break;
    case p.args.includes("init-config"): // don't get a config if running init
      break;
    default:
      c = getConfig(fs, p.configPath);
      if (!c) return;
      p.parsedConfig = c;
  }
};

main(program);
