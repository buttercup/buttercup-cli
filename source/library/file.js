const path = require("path");

function extractTitleFromPath(filePath) {
    const [name] = path.basename(filePath).split(".");
    return name;
}

module.exports = {
    extractTitleFromPath
};
