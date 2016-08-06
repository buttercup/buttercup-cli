const { Workspace, FileDatasource, Archive } = require("buttercup");

const menu = require("../tools/menu.js");
const createArchiveHandler = require("./archive.js");

const AUTH_METHODS = [
    { title: "Password only",                   value: "password" },
    { title: "Key-file only",                   value: "keyfile" },
    { title: "Password and Key-file",           value: "password,keyfile" }
];

function openArchiveFile(filePath, auth, newArchive = false) {
    let workspace = new Workspace(),
        datasource = new FileDatasource(filePath);
    workspace
        .setDatasource(datasource)
        .setPassword(auth.password);
    if (newArchive) {
        return workspace
            .setArchive(new Archive())
            .save()
            .then(function() {
                let archiveHandler = createArchiveHandler(workspace);
                return archiveHandler.begin();
            });
    }
    return datasource
        .load(auth.password)
        .then(function(archive) {
            workspace.setArchive(archive);
            let archiveHandler = createArchiveHandler(workspace);
            return archiveHandler.begin();
        });
}

let openArchive = module.exports = {

    createArchiveWithFilename: function(filename) {
        return openArchive
            .selectOpenMethods()
            .then(openArchive.getRequiredAuthenticationInfo)
            .then(function(authInfo) {
                return openArchiveFile(filename, authInfo, true);
            });
    },

    getRequiredAuthenticationInfo: function(authMethods) {
        return Promise.resolve({})
            .then(function(info) {
                if (authMethods.indexOf("password") >= 0) {
                    return menu
                        .presentPasswordPrompt()
                        .then(function(pass) {
                            info.password = pass;
                            return info;
                        });
                }
                return info;
            })
            .then(function(info) {
                if (authMethods.indexOf("keyfile") >= 0) {
                    // @todo handle this
                }
                return info;
            });
    },

    openFile: function(filename) {
        return openArchive
            .selectOpenMethods()
            .then(openArchive.getRequiredAuthenticationInfo)
            .then(function(authInfo) {
                return openArchiveFile(filename, authInfo);
            });
    },

    selectOpenMethods: function() {
        return menu
            .presentSelectMenu("Authentication method(s)", AUTH_METHODS)
            .then((methods) => methods.split(","));
    }

};
