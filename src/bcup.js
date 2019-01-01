#!/usr/bin/env node

var program = require("commander");

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
