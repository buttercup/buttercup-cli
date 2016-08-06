const menu = require("../tools/menu.js");

const BASE_MENU = [
    { title: "Back",                            value: "+back" },
    { title: "Clear all",                       value: "+clear" }
];

let recentArchiveHandler = module.exports = {

    handleMenuAction: function(command) {
        if (command === "+back") {
            let mainMenu = require("./main-menu.js"); // eslint-disable-line
            return mainMenu.presentMenu();
        }
        return recentArchiveHandler.presentRecentArchivesMenu();
    },

    presentRecentArchivesMenu: function() {
        let items = [].concat(BASE_MENU);
        return menu
            .presentSelectMenu("Recent archives", items)
            .then(recentArchiveHandler.handleMenuAction);
    }

};
