var os = require("os");

const log = msg => console.log(msg); // eslint-disable-line

// returns whether object key value is of the expected type.
const validateObjectKeyType = (obj, k, t) => typeof obj[k] === t;

// sorts object keys and expected keys and returns whether the object has all of the expected keys.
const objHasKeys = (obj, keys) => {
  keys = keys.sort();
  const objKeys = Object.keys(obj).sort();

  if (keys.length !== objKeys.length) {
    return false;
  }

  for (const [i, k] of objKeys.entries()) {
    if (keys[i] !== k) {
      return false;
    }
  }

  return true;
};

const defaultConfigPath = `${os.homedir()}/.buttercup.json`;

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

const validateConfig = c => {
  // give c all of the top level keys in defualt, and the spread c into it
  // overwriting the defaults if the kyes are present
  c = {
    ...defaultConfig,
    ...c
  };

  const defaultKeys = Object.keys(defaultConfig).sort();
  if (!objHasKeys(c, defaultKeys)) {
    log(
      `your config has invalid keys ${Object.keys(
        c
      )}, valid keys are: ${defaultKeys}`
    );
    return false;
  }

  const archiveIndexKeys = Object.keys(defaultConfig.archives[0]).sort();
  for (const archive of c.archives) {
    if (!objHasKeys(archive, archiveIndexKeys)) {
      log(
        `your archive has invalid keys: ${archive}, valid keys are ${archiveIndexKeys}`
      );
      return false;
    }

    for (const k of archiveIndexKeys) {
      const expected = typeof defaultConfig.archives[0][k];
      if (!validateObjectKeyType(archive, k, expected)) {
        log(
          `your archive key types are invalid, expected ${expected} for keys: ${archiveIndexKeys}`
        );
        return false;
      }
    }
  }

  return true;
};

// getConfig returns the parsed JSON config or false if there is no file
const getConfig = (_fs, path) => {
  if (_fs.existsSync(path)) {
    const c = _fs.readFileSync(path);
    const config = JSON.parse(c);
    if (validateConfig(config)) {
      return config;
    }
  }

  log(
    `there was a problem loading a config (${path}), check that the file exists and is valid`
  );
  return false;
};

module.exports = {
  log,
  validateObjectKeyType,
  objHasKeys,
  defaultConfig,
  validateConfig,
  defaultConfigPath,
  getConfig
};
