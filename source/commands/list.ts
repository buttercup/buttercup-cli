import Table from "cli-table3";
import chalk from "chalk";
import { EntryPropertyType, Group, GroupFacade, VaultSourceStatus } from "buttercup";
import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getCurrentVaults } from "../client/adapter";
import { getKeys } from "../library/keys";
import { generateIndentation } from "../library/formatting";
import { TREE_INDENT_SPACES } from "../symbols";
import { ArgVList, DaemonCommand, DaemonResponseStatus, VaultContentsPayload, VaultContentsResponse } from "../types";

export async function list(argv: ArgVList) {
    const [type] = argv._;
    switch (type) {
        case "entry":
            /* falls-through */
        case "entries":
            return listGroups(argv, true);
        case "group":
            /* falls-through */
        case "groups":
            return listGroups(argv);
        case "vault":
            /* falls-through */
        case "vaults":
            return listSources(argv);
        default:
            throw new Error(`Invalid list type: ${type}`);
    }
}

async function listGroups(argv: ArgVList, renderEntries: boolean = false) {
    const {
        id,
        index,
        output = "tree",
        vault
    } = argv;
    // Check parameters
    if (!/^\d+$/.test(`${index}`) && !id && !vault) {
        throw new Error(`Either id or index must be specified`);
    }
    // Launch daemon
    await launchDaemon();
    // Request source content
    const requestPayload: VaultContentsPayload = {
        id,
        index,
        vault
    };
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.GetVaultContents,
        payload: requestPayload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed fetching vault contents: ${response.error || "Unknown error"}`);
    }
    const { vault: vaultFacade } = (<VaultContentsResponse> response.payload);
    // Render
    if (output === "tree") {
        (function renderGroups(groups: Array<GroupFacade>, parent = "0", indent = 0) {
            groups.forEach(group => {
                if (group.parentID !== parent) return;
                const isTrash = group.attributes[Group.Attribute.Role] === "trash";
                const title = renderEntries
                    ? chalk.dim(group.title)
                    : isTrash ? chalk.red(group.title) : group.title;
                console.log(`${generateIndentation(indent)}${chalk.dim(group.id)} ${title}`);
                if (renderEntries) {
                    vaultFacade.entries.forEach(entry => {
                        if (entry.parentID === group.id) {
                            const entryTitle = entry.fields.find(f => f.propertyType === EntryPropertyType.Property && f.property === "title").value;
                            console.log(`${generateIndentation(indent + 1)}${chalk.dim(entry.id)} ${entryTitle}`);
                        }
                    });
                }
                renderGroups(groups, group.id, indent + TREE_INDENT_SPACES);
            });
        })(vaultFacade.groups);
    } else {
        throw new Error(`Unsupported output type: ${output}`);
    }
}

async function listSources(argv: ArgVList) {
    const {
        output = "table"
    } = argv;
    const sources = await getCurrentVaults();
    if (output === "table") {
        const table = new Table({
            head: ["#", "Name", "Type", "Status", "ID"].map(str => chalk.white.bold(str))
        });
        const highlightStatus = status => {
            if (status === VaultSourceStatus.Locked) {
                return chalk.red(status);
            } else if (status === VaultSourceStatus.Unlocked) {
                return chalk.green(status);
            }
            return status;
        };
        sources.forEach(source => {
            table.push([
                source.order,
                source.name,
                source.type,
                highlightStatus(source.status),
                source.id
            ]);
        });
        console.log(table.toString());
    } else if (output === "json") {
        console.log(JSON.stringify(sources, undefined, 2));
    } else {
        throw new Error(`Unsupported output type: ${output}`);
    }
}
