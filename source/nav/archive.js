const chalk = require("chalk");

const menu = require("../tools/menu.js");
const entryHandler = require("./entry.js");
const groupHandler = require("./group.js");

const ARCHIVE_BACK =    { title: "Back", value: "+back" };
const ARCHIVE_CLOSE =   { title: "Close", value: "+close" };
const ARCHIVE_TOROOT =  { title: "Root", value: "+root" };
const CREATE_ENTRY =    { title: "Create entry", value: "+newentry" };
const CREATE_GROUP =    { title: "Create group", value: "+newgroup" };
const DELETE_GROUP =    { title: "Delete group", value: "+deletegroup" };

function getNodeTitleForBreadcrumbs(node, end = false) {
    let title = node.getTitle ? node.getTitle() : "(Root)";
    if (end) {
        return chalk.underline(title);
    }
    return chalk.gray(title);
}

function logBreadcrumbs(chain, current) {
    let breadCrumbs = " • ";
    breadCrumbs += chain
        .map(getNodeTitleForBreadcrumbs)
        .concat(getNodeTitleForBreadcrumbs(current, true))
        .join(" / ");
    console.log(breadCrumbs);
}

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
            } else if (action === "+newentry") {
                return groupHandler
                    .createEntry(currentNode)
                    .then(() => archiveHandler.presentCurrentNode());
            } else if (action === "+newgroup") {
                return groupHandler
                    .createGroup(currentNode) // returns group
                    .then(() => archiveHandler.presentCurrentNode());
            } else if (action === "+deletegroup") {
                return groupHandler
                    .deleteGroup(currentNode)
                    .then(function(deleted) {
                        return deleted ?
                            archiveHandler.handleMenuAction("+back") :
                            archiveHandler.presentCurrentNode();
                    });
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
            logBreadcrumbs(nodeChain, currentNode);
            let menuItems = [],
                isRoot = currentNode === archive,
                groups = currentNode.getGroups(),
                entries = isRoot ? [] : currentNode.getEntries();
            if (isRoot) {
                menuItems.push(ARCHIVE_CLOSE);
                menuItems.push(CREATE_GROUP);
            } else {
                menuItems.push(ARCHIVE_BACK);
                menuItems.push(ARCHIVE_TOROOT);
                menuItems.push(DELETE_GROUP);
                menuItems.push(CREATE_GROUP);
                menuItems.push(CREATE_ENTRY);
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
