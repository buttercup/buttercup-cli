const menu = require("../tools/menu.js");

const ARCHIVE_BACK =    { title: "Back", value: "+back" };
const ARCHIVE_TOROOT =  { title: "Root", value: "+root" };

module.exports = function initWithWorkspace(workspace) {
    let archive = workspace.getArchive(),
        currentNode = archive,
        nodeChain = [];
    let archiveHandler = {
        begin: function() {
            return archiveHandler.presentCurrentNode();
        },

        handleMenuAction: function(action) {
            if (action === "+close") {
                return;
            } else if (action === "+back") {
                currentNode = nodeChain.pop();
            } else {
                let [context, id] = action.split(":");
                if (context === "g") {
                    nodeChain.push(currentNode);
                    currentNode = archive.getGroupByID(id);
                }
            }
            return archiveHandler.presentCurrentNode();
        },

        presentCurrentNode: function() {
            let menuItems = [],
                groups = currentNode.getGroups();
            if (currentNode !== archive) {
                menuItems.push(ARCHIVE_BACK);
                menuItems.push(ARCHIVE_TOROOT);
            }
            groups.forEach(function(group) {
                menuItems.push({
                    title: `/${group.getTitle()}/`,
                    value: `g:${group.getID()}`
                });
            });
            return menu
                .presentSelectMenu("Archive action", menuItems)
                .then((action) => archiveHandler.handleMenuAction(action));
        }
    };
    return archiveHandler;
};
