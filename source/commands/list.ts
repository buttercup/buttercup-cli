import Table from "cli-table3";
import chalk from "chalk";
import { VaultSourceStatus } from "buttercup";
import { launchDaemon } from "../client/launch";
import { sendMessage } from "../client/request";
import { getKeys } from "../library/keys";
import { ArgVList, DaemonCommand, DaemonResponseStatus, ListSourcesPayload, ListSourcesResponse } from "../types";

export async function list(argv: ArgVList) {
    const [type] = argv._;
    switch (type) {
        case "vaults":
            return listSources(argv);
        default:
            throw new Error(`Invalid list type: ${type}`);
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
        throw new Error(`Failed listing vault sources: ${response.error || "Unknown error"}`);
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
    }
}
