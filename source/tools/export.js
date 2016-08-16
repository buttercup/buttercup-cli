const fs = require("fs");
const expandHomeDir = require("expand-home-dir");
const { tools } = require("buttercup");

module.exports = {

    exportToJSONFile: function(archive, filename) {
        filename = expandHomeDir(filename);
        let dataObj = tools.export.exportArchiveToJSON(archive);
        fs.writeFileSync(filename, JSON.stringify(dataObj));
    }

};
