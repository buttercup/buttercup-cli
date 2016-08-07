const menu = require("../tools/menu.js");
const createRecentTools = require("../tools/recents.js");
const authMenu = require("./auth.js");
const initWithWorkspace = require("./archive.js");

const recentsTools = createRecentTools(global.config);

const BASE_MENU = [
    { title: "Back",                            value: "+back" },
    { title: "Clear all",                       value: "+clear" }
];

let recentArchiveHandler = module.exports = {

    handleMenuAction: function(command) {
        if (command === "+back") {
            let mainMenu = require("./main-menu.js"); // eslint-disable-line
            return mainMenu.presentMenu();
        } else if (command === "+clear") {
            return recentsTools
                .clearRecents()
                .then(() => recentArchiveHandler.presentRecentArchivesMenu());
        } else if (command.name) {
            return recentArchiveHandler.loadFromRecent(command);
        }
        return recentArchiveHandler.presentRecentArchivesMenu();
    },

    loadFromRecent: function(recent) {
        return authMenu
            .selectAuthMethods()
            .then(authMenu.getRequiredAuthenticationInfo)
            .then((authInfo) => recentsTools.loadWorkspaceFromRecent(recent, authInfo.password))
            .then(function(workspace) {
                let handler = initWithWorkspace(workspace);
                return handler.begin();
            });
    },

    presentRecentArchivesMenu: function() {
        let items = [].concat(BASE_MENU),
            recents = recentsTools.getRecents();
        if (recents.length > 0) {
            items = items.concat(recents.map(function(recent) {
                return {
                    title: `→ ${recent.name}`,
                    value: recent
                };
            }));
        }
        return menu
            .presentSelectMenu("Recent archives", items)
            .then(recentArchiveHandler.handleMenuAction);
    }

};
