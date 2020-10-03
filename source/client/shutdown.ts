import { daemonRunning, sendMessage } from "../library/daemon";
import { getKeys } from "../library/keys";
import { DaemonCommand } from "../types";

export async function shutdown() {
    const running = await daemonRunning();
    if (!running) {
        console.log("Daemon isn't running");
        return;
    }
    const keys = await getKeys();
    await sendMessage({
        type: DaemonCommand.Shutdown
    }, keys);
    console.log("Sent shutdown command");
}
