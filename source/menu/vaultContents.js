const figures = require("figures");
const isWindows = require("is-windows");
const { createArchiveFacade, getSharedManager } = require("../buttercup/archiveManagement.js");
const { showScroller } = require("../ui/scroller.js");
const { colourDim } = require("./misc.js");

function createTree(facade, { currentGroup = "0", indent = 0, openGroups = [] } = {}) {
    return [
        ...facade.groups.reduce((groups, group) => {
            if (group.parentID === currentGroup) {
                const arrowFigure = openGroups.includes(group.id) ? figures.arrowDown : figures.arrowRight;
                groups.push({
                    text: `${generateIndent(indent)}${arrowFigure} ${group.title}`,
                    type: "group",
                    id: group.id
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
                    type: "entry",
                    id: entry.id
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

function runVaultContentsMenu(sourceID) {
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const archiveFacade = createArchiveFacade(source.workspace.archive);
    let items = createTree(archiveFacade),
        openGroups = [];
    console.log(colourDim("(Open = enter, Delete = d, Move = m, Cancel/Quit = q)"));
    const { stop, update } = showScroller({
        lines: items.map(item => item.text),
        onKey: (key, idx) => {
            const item = items[idx];
            // console.log(key); process.exit(0);
            // console.log("KEY", key, "\n\n");
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
            }
        },
        visibleLines: 8
    });
}

module.exports = {
    runVaultContentsMenu
};
