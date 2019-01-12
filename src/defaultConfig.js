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

const validateConfig = c => {};

module.exports = {
  defaultConfig
};
