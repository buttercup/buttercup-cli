const { Credentials, Workspace, tools } = require("buttercup");

const datasourceTools = tools.datasource;

module.exports = function preprareRecentsTools(config) {
    return {

        addRecent: function(name, datasource, credentialStr) {
            let recents = config.get("recents", []),
                newRecent = {
                    name,
                    ds: datasource.toString(),
                    creds: credentialStr
                },
                replaced = false;
            for (let i = 0, recentsLen = recents.length; i < recentsLen; i += 1) {
                if (recents[i].name === name) {
                    recents[i] = newRecent;
                    replaced = true;
                    break;
                }
            }
            if (!replaced) {
                recents.push(newRecent);
            }
            config.write("recents", recents);
            return config.save();
        },

        clearRecents: function() {
            config.write("recents", []);
            return config.save();
        },

        getRecents: function() {
            return config.get("recents", []);
        },

        loadWorkspaceFromRecent: function(recent, masterPass) {
            return Credentials
                .createFromSecureContent(recent.creds, masterPass)
                .then(function(credentials) {
                    let datasource = datasourceTools.stringToDatasource(recent.ds, credentials);
                    return datasource
                        .load(masterPass)
                        .then(function(archive) {
                            let workspace = new Workspace();
                            workspace
                                .setPassword(masterPass)
                                .setArchive(archive)
                                .setDatasource(datasource);
                            return workspace;
                        });
                });
        }

    };
};
