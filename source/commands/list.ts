import Table from "cli-table3";
import chalk from "chalk";
import { Group, GroupFacade, VaultSourceStatus } from "buttercup";
import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getKeys } from "../library/keys";
import { generateIndentation } from "../library/formatting";
import { TREE_INDENT_SPACES } from "../symbols";
import { ArgVList, DaemonCommand, DaemonResponseStatus, ListSourcesPayload, ListSourcesResponse, VaultContentsPayload, VaultContentsResponse } from "../types";

export async function list(argv: ArgVList) {
    const [type] = argv._;
    switch (type) {
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

async function listGroups(argv: ArgVList) {
    const {
        id,
        index,
        output = "tree"
    } = argv;
    // Check parameters
    if (!/^\d+$/.test(`${index}`) && !id) {
        throw new Error(`Either id or index must be specified`);
    }
    // Launch daemon
    await launchDaemon();
    // Request source content
    const requestPayload: VaultContentsPayload = {
        id,
        index
    };
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.GetVaultContents,
        payload: requestPayload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed fetching vault contents: ${response.error || "Unknown error"}`);
    }
    const { vault } = (<VaultContentsResponse> response.payload);
    // Render
    if (output === "tree") {
        (function renderGroups(groups: Array<GroupFacade>, parent = "0", indent = 0) {
            groups.forEach(group => {
                if (group.parentID !== parent) return;
                const isTrash = group.attributes[Group.Attribute.Role] === "trash";
                const title = isTrash ? chalk.red(group.title) : group.title;
                console.log(`${generateIndentation(indent)}${chalk.dim(group.id)} ${title}`);
                renderGroups(groups, group.id, indent + TREE_INDENT_SPACES);
            });
        })(vault.groups);
    } else {
        throw new Error(`Unsupported output type: ${output}`);
    }
}

async function listSources(argv: ArgVList) {
    const {
        output = "table"
    } = argv;
    // Launch daemon
    await launchDaemon();
    // Request list of sources
    const requestPayload: ListSourcesPayload = {
        locked: true,
        unlocked: true
    };
    const keys = await getKeys();
    const response = await sendMessage({
        type: DaemonCommand.ListSources,
        payload: requestPayload
    }, keys);
    if (response.status !== DaemonResponseStatus.OK) {
        throw new Error(`Failed listing vaults: ${response.error || "Unknown error"}`);
    }
    const { sources } = (<ListSourcesResponse> response.payload);
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
