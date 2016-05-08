"use strict";

const Buttercup = require("buttercup");
const FileDatasource = Buttercup.FileDatasource;

const PasswordPrompt = require("./PasswordPrompt.js");

module.exports = class Application {

    constructor(scr) {
        this.screen = scr;

        this.workspace = null;
        this.archive = null;
    }

    getPassword() {
        let pp = new PasswordPrompt();
        pp.appendToScreen();
        return pp.getPassword()
            .then((pass) => {
                pp.destroy();
                return pass;
            });
    }

    openArchive(archive) {
        console.log(archive);
    }

    openArchiveFile(filename) {
        var fds = new FileDatasource(filename);
        this.getPassword()
            .then((password) => fds.load(password))
            .then((archive) => {
                this.openArchive(archive);
            });
    }

};
