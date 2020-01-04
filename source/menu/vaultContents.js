const figures = require("figures");
const isWindows = require("is-windows");
const { createArchiveFacade, getSharedManager } = require("../buttercup/archiveManagement.js");
const { showScroller } = require("../ui/scroller.js");
const { colourDim } = require("./misc.js");
const { drawMenu } = require("./menu.js");
const { getInput } = require("../library/input.js");

function createTree(facade, { currentGroup = "0", indent = 1, openGroups = [] } = {}) {
    return [
        ...(currentGroup === "0" ? [
            {
                text: colourDim("(vault root)"),
                title: "(vault root)",
                type: "vault",
                id: "0",
                containerID: "0"
            }
        ]: []),
        ...facade.groups.reduce((groups, group) => {
            if (group.parentID === currentGroup) {
                const arrowFigure = openGroups.includes(group.id) ? figures.arrowDown : figures.arrowRight;
                groups.push({
                    text: `${generateIndent(indent)}${arrowFigure} ${group.title}`,
                    title: group.title,
                    type: "group",
                    id: group.id,
                    containerID: group.id
                });
                if (openGroups.includes(group.id)) {
                    groups.push(...createTree(facade, {
                        currentGroup: group.id,
                        indent: indent + 1,
                        openGroups
                    }));
                }
            }
            return groups;
        }, []),
        ...facade.entries.reduce((entries, entry) => {
            if (entry.parentID === currentGroup) {
                const title = entry.fields.find(field => field.propertyType === "property" && field.property === "title").value;
                entries.push({
                    text: `${generateIndent(indent)}${figures.bullet} ${title}`,
                    title,
                    type: "entry",
                    id: entry.id,
                    containerID: entry.parentID
                });
            }
            return entries;
        }, [])
    ];
}

function generateIndent(count) {
    let output = "",
        indentLeft = count;
    while (indentLeft > 0) {
        indentLeft -= 1;
        output += "  ";
    }
    return output;
}

async function runNewGroup(sourceID, parentGroupID) {
    const { performSaveSource } = require("./vault.js");
    const groupTitle = await getInput("Group title (empty for cancel): ");
    if (!groupTitle) {
        runVaultContentsMenu(sourceID);
        return;
    }
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const parent = parentGroupID == "0" ? source.workspace.archive : source.workspace.archive.findGroupByID(parentGroupID);
    parent.createGroup(groupTitle);
    await performSaveSource(source);
    runVaultContentsMenu(sourceID);
}

function runNewItemMenu(sourceID, parentGroupID, parentTitle) {
    const { runVaultAccessMenu } = require("./vault.js");
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const choices = [
        { key: "g", text: "New Group", cb: () => runNewGroup(sourceID, parentGroupID) }
    ];
    if (parentGroupID != "0") {
        choices.push(
            { key: "e", text: "New Entry", cb: () => {} }
        );
    }
    drawMenu(
        `Add item item to '${parentTitle}':`,
        [
            ...choices,
            { key: "q", text: "Quit / Back", cb: () => runVaultContentsMenu(sourceID) }
        ],
        {
            onFailure: err => {
                console.error(err);
                runVaultAccessMenu(sourceID);
            }
        }
    );
}

function runVaultContentsMenu(sourceID) {
    const { runVaultAccessMenu } = require("./vault.js");
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const archiveFacade = createArchiveFacade(source.workspace.archive);
    let items = createTree(archiveFacade),
        openGroups = [];
    console.log(colourDim("(Open = enter, Delete = d, Move = m, New Group/Entry = n, Edit = e, Cancel/Quit = q)"));
    const { stop, update } = showScroller({
        lines: items.map(item => item.text),
        onKey: (key, idx) => {
            const item = items[idx];
            if (key.name === "return") {
                if (item.type === "group") {
                    if (openGroups.includes(item.id)) {
                        openGroups = openGroups.filter(gID => gID !== item.id);
                    } else {
                        openGroups.push(item.id);
                    }
                    items = createTree(archiveFacade, { openGroups });
                    update(items.map(item => item.text));
                }
            } else if (key.name === "n") {
                stop();
                return runNewItemMenu(sourceID, item.containerID, item.title);
            } else if (key.name === "q") {
                stop();
                return runVaultAccessMenu(sourceID);
            }
        },
        visibleLines: 8
    });
}

module.exports = {
    runVaultContentsMenu
};
