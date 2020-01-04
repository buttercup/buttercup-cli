const figures = require("figures");
const isWindows = require("is-windows");
const { Entry } = require("buttercup");
const { FIELD_VALUE_TYPE_NOTE, FIELD_VALUE_TYPE_OTP, FIELD_VALUE_TYPE_PASSWORD, FIELD_VALUE_TYPE_TEXT } = require("@buttercup/facades");
const { createArchiveFacade, getSharedManager } = require("../buttercup/archiveManagement.js");
const { showScroller } = require("../ui/scroller.js");
const { colourDim, colourOption } = require("./misc.js");
const { drawMenu } = require("./menu.js");
const { editInput, getInput } = require("../library/input.js");
const { padLine } = require("../library/format.js");

const MAX_ENTRY_TITLE_LENGTH = 40;
const NEW_PROPERTY_SUGGESTIONS = [
    "email",
    "hotp",
    "id",
    "key",
    "mobile",
    "otp",
    "phone",
    "pin",
    "secret",
    "ssh_private_key",
    "ssh_public_key",
    "telephone",
    "token",
    "totp",
    "url"
];
const SCROLLER_VISIBLE_LINES = 8;

async function addEntryProperty(sourceID, entryID) {
    const { performSaveSource } = require("./vault.js");
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const entry = source.workspace.archive.findEntryByID(entryID);
    const valueTypeAction = await drawMenu(
        "Property type:",
        [
            { key: "t", text: "Plain / Text" },
            { key: "n", text: "Note" },
            { key: "p", text: "Password (Secret)" },
            { key: "o", text: "OTP (One Time Password) URI" }
        ]
    );
    let valueType;
    switch (valueTypeAction) {
        case "t":
            valueType = FIELD_VALUE_TYPE_TEXT;
            break;
        case "n":
            valueType = FIELD_VALUE_TYPE_NOTE;
            break;
        case "p":
            valueType = FIELD_VALUE_TYPE_PASSWORD;
            break;
        case "o":
            valueType = FIELD_VALUE_TYPE_OTP;
            break;
        default:
            throw new Error(`Unknown property type menu selection: ${valueTypeAction}`);
    }
    const property = await getInput("Property name: ", NEW_PROPERTY_SUGGESTIONS);
    const value = await getInput("Property value: ");
    const existingValue = entry.getProperty(property);
    if (typeof existingValue !== "undefined") {
        const action = await drawMenu(
            "Property with this name already exists - what would you like to do?",
            [
                { key: "o", text: "Override existing value" },
                { key: "c", text: "Cancel value change" }
            ]
        );
        if (action !== "o") {
            runEditEntry(sourceID, entryID);
            return;
        }
    }
    entry.setProperty(property, value);
    entry.setAttribute(`${Entry.Attributes.FieldTypePrefix}${property}`, valueType);
    await performSaveSource(source);
    runEditEntry(sourceID, entryID);
}

function createArchiveTree(facade, { currentGroup = "0", indent = 1, openGroups = [] } = {}) {
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
                    groups.push(...createArchiveTree(facade, {
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

function createEntryScrollerItems(entryFacade, options = {}) {
    const { showingHidden = false } = options;
    const keyLen = entryFacade.fields.reduce((len, field) => {
        if (field.propertyType === "property") {
            const title = field.title || field.property;
            return Math.min(
                Math.max(len, title.length),
                MAX_ENTRY_TITLE_LENGTH
            );
        }
        return len;
    }, 0);
    const items = entryFacade.fields.reduce((output, field) => {
        if (field.propertyType === "property") {
            const title = field.title || field.property;
            const isHidden = field.valueType === FIELD_VALUE_TYPE_PASSWORD && !showingHidden;
            const value = field.value ? field.value : "";
            output.push({
                text: `${colourOption(padLine(title, keyLen))}: ${isHidden ? colourDim("(hidden)") : value}`,
                type: "property",
                field
            });
        }
        return output;
    }, []);
    return [
        ...items,
        {
            text: colourDim(`${figures.arrowRight} add property`),
            type: "add-property"
        }
    ];
}

async function editEntryValue(sourceID, entryID, property, propertyType, title, existingValue = "") {
    const { performSaveSource } = require("./vault.js");
    const newValue = await editInput(`${title}: `, existingValue);
    if (newValue === null) {
        // Edit cancelled
        runEditEntry(sourceID, entryID);
        return;
    }
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const entry = source.workspace.archive.findEntryByID(entryID);
    if (propertyType === "attribute") {
        throw new Error("Attribute editing not implemented");
    }
    entry.setProperty(property, newValue);
    await performSaveSource(source);
    runEditEntry(sourceID, entryID);
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

async function runEditEntry(sourceID, entryID) {
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const archiveFacade = createArchiveFacade(source.workspace.archive);
    const entryFacade = archiveFacade.entries.find(item => item.id === entryID);
    // Scroller
    const _createItems = () => createEntryScrollerItems(entryFacade, { showingHidden });
    let showingHidden = false,
        items = _createItems();
    const { stop, update } = showScroller({
        lines: items.map(item => item.text),
        onKey: (key, idx) => {
            const item = items[idx];
            if (key.name === "return") {
                if (item.type === "add-property") {
                    stop();
                    return addEntryProperty(sourceID, entryID);
                } else if (item.type === "property") {
                    stop();
                    return editEntryValue(
                        sourceID,
                        entryID,
                        item.field.property,
                        item.field.propertyType,
                        item.field.title || item.field.property,
                        item.field.value
                    );
                } else {
                    throw new Error(`Unknown item type: ${item.type}`);
                }
            } else if (key.name === "e") {
                stop();
                return editEntryValue(
                    sourceID,
                    entryID,
                    item.field.property,
                    item.field.propertyType,
                    item.field.title || item.field.property,
                    item.field.value
                );
            } else if (key.name === "q") {
                stop();
                return runVaultContentsMenu(sourceID);
            } else if (key.name === "h") {
                showingHidden = !showingHidden;
                items = _createItems();
                update(items.map(item => item.text));
            }
        },
        prefix: colourDim("(Edit = enter / e, Copy = c, Delete = d, Toggle Hidden = h, Cancel/Quit = q)"),
        visibleLines: SCROLLER_VISIBLE_LINES
    });
}

async function runNewEntry(sourceID, parentGroupID) {
    const { performSaveSource } = require("./vault.js");
    const entryTitle = await getInput("Entry title (empty for cancel): ");
    if (!entryTitle) {
        runVaultContentsMenu(sourceID);
        return;
    }
    const archiveManager = getSharedManager();
    const source = archiveManager.getSourceForID(sourceID);
    const parent = source.workspace.archive.findGroupByID(parentGroupID);
    const entry = parent.createEntry(entryTitle);
    await performSaveSource(source);
    runEditEntry(sourceID, entry.id);
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
            { key: "e", text: "New Entry", cb: () => runNewEntry(sourceID, parentGroupID) }
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
    let items = createArchiveTree(archiveFacade),
        openGroups = [];
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
                    items = createArchiveTree(archiveFacade, { openGroups });
                    update(items.map(item => item.text));
                }
            } else if (key.name === "n") {
                stop();
                return runNewItemMenu(sourceID, item.containerID, item.title);
            } else if (key.name === "e") {
                if (item.type === "entry") {
                    stop();
                    return runEditEntry(sourceID, item.id);
                }
            } else if (key.name === "q") {
                stop();
                return runVaultAccessMenu(sourceID);
            }
        },
        prefix: colourDim("(Open = enter, Delete = d, Move = m, New Group/Entry = n, Edit = e, Cancel/Quit = q)"),
        visibleLines: SCROLLER_VISIBLE_LINES
    });
}

module.exports = {
    runVaultContentsMenu
};
