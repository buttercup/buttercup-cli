const menu = require("../tools/menu.js");

const ARCHIVE_BACK = { title: "Back", value: "+back" };
const ARCHIVE_BASE = [
    { title: "Close archive",                   value: "+close" }
];

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
            let menuItems = [].concat(ARCHIVE_BASE),
                groups = currentNode.getGroups(),
                index = 0;
            if (currentNode !== archive) {
                menuItems.push(ARCHIVE_BACK);
                index = 1;
            }
            groups.forEach(function(group) {
                menuItems.push({
                    title: `/${group.getTitle()}/`,
                    value: `g:${group.getID()}`
                });
            });
            console.log("DDDD", menuItems, index);
            return menu
                .presentSelectMenu("Archive action", menuItems, index)
                .then((action) => archiveHandler.handleMenuAction(action));
        }
    };
    return archiveHandler;
};
