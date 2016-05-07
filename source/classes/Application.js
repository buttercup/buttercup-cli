"use strict";

const Buttercup = require("buttercup");
const FileDatasource = Buttercup.FileDatasource;

module.exports = class Application {

    constructor(scr) {
        this.screen = scr;

        this.workspace = null;
        this.archive = null;
    }

    openArchive(archive) {

    }

    openArchiveFile(filename) {
        var fds = new FileDatasource(filename);
    }

};
