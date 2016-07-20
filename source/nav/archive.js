const tuck = require("tuck");
const menu = require("../tools/menu.js");
const entryHandler = require("./entry.js");

const ARCHIVE_BACK =    { title: "Back", value: "+back" };
const ARCHIVE_CLOSE =   { title: "Close", value: "+close" };
const ARCHIVE_TOROOT =  { title: "Root", value: "+root" };

// function renderEntry(entry) {
//     console.log(tuck(
//         [
//             entry.getProperty("title"),
//             "───",
//             `Username:   ${entry.getProperty("username")}`,
//             "Password:   ********"
//         ], {
//             center: false,
//             textCenter: false
//         }
//     ));
// }

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
            } else if (action === "+root") {
                currentNode = archive;
                nodeChain = [];
            } else {
                let [context, id] = action.split(":");
                if (context === "g") {
                    nodeChain.push(currentNode);
                    currentNode = archive.getGroupByID(id);
                } else if (context === "e") {
                    let entry = archive.getEntryByID(id);
                    entryHandler.renderEntry(entry);
                    return entryHandler
                        .handleEntry(entry)
                        .then(() => archiveHandler.presentCurrentNode());
                }
            }
            return archiveHandler.presentCurrentNode();
        },

        presentCurrentNode: function() {
            let menuItems = [],
                isRoot = currentNode === archive,
                groups = currentNode.getGroups(),
                entries = isRoot ? [] : currentNode.getEntries();
            if (isRoot) {
                menuItems.push(ARCHIVE_CLOSE);
            } else {
                menuItems.push(ARCHIVE_BACK);
                menuItems.push(ARCHIVE_TOROOT);
            }
            groups.forEach(function(group) {
                menuItems.push({
                    title: `» ${group.getTitle()}`,
                    value: `g:${group.getID()}`
                });
            });
            entries.forEach(function(entry) {
                menuItems.push({
                    title: `› ${entry.getProperty("title")}`,
                    value: `e:${entry.getID()}`
                });
            });
            return menu
                .presentSelectMenu("Archive action", menuItems)
                .then((action) => archiveHandler.handleMenuAction(action));
        }
    };
    return archiveHandler;
};
