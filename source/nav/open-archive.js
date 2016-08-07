const { Workspace, FileDatasource, Archive, Credentials } = require("buttercup");

const createRecentTools = require("../tools/recents.js");
const authMenu = require("./auth.js");
const createArchiveHandler = require("./archive.js");

const recentsTools = createRecentTools(global.config);

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
                return saveRecent(`File: ${filePath}`, datasource, new Credentials(), auth.password);
            })
            .then(function() {
                let archiveHandler = createArchiveHandler(workspace);
                return archiveHandler.begin();
            });
    }
    return datasource
        .load(auth.password)
        .then(function(archive) {
            return saveRecent(`File: ${filePath}`, datasource, new Credentials(), auth.password)
                .then(() => archive);
        })
        .then(function(archive) {
            workspace.setArchive(archive);
            let archiveHandler = createArchiveHandler(workspace);
            return archiveHandler.begin();
        });
}

function saveRecent(name, datasource, credentials, masterPass) {
    return credentials
        .convertToSecureContent(masterPass)
        .then(function(credentialsStr) {
            return recentsTools.addRecent(name, datasource, credentialsStr);
        });
}

module.exports = {

    createArchiveWithFilename: function(filename) {
        return authMenu
            .selectAuthMethods()
            .then(authMenu.getRequiredAuthenticationInfo)
            .then(function(authInfo) {
                return openArchiveFile(filename, authInfo, true);
            });
    },

    openFile: function(filename) {
        return authMenu
            .selectAuthMethods()
            .then(authMenu.getRequiredAuthenticationInfo)
            .then(function(authInfo) {
                return openArchiveFile(filename, authInfo);
            });
    }

};
