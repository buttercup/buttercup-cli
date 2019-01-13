const log = msg => console.log(msg);

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
    return false;
  }

  const archiveIndexKeys = Object.keys(defaultConfig.archives[0]).sort();
  for (const archive of c.archives) {
    if (!objHasKeys(archive, archiveIndexKeys)) {
      return false;
    }

    for (const k of archiveIndexKeys) {
      if (!validateObjectKeyType(archive, k, "string")) {
        return false;
      }
    }
  }

  return true;
};

module.exports = {
  log,
  validateObjectKeyType,
  objHasKeys,
  defaultConfig,
  validateConfig
};
