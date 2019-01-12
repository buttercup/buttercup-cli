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

module.exports = {
  log,
  validateObjectKeyType,
  objHasKeys
};
