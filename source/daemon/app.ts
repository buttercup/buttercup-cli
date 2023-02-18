import express from "express";
import bodyParser from "body-parser";
import { handleCommand } from "./router";
import { handleAuth } from "./auth";
import { DAEMON_PORT } from "../symbols";

let __app,
    __server;

export async function startDaemon() {
    __app = express();
    __app.use(bodyParser.text({
        limit: "100mb"
    }));
    __app.get("/", (req, res) => {
        res
            .status(200)
            .set("Content-Type", "application/json")
            .send(JSON.stringify({
                ok: true,
                type: "bcup-cli-daemon",
                ttl: process.env.TTL
            }));
    });
    __app.post("/", handleAuth, handleCommand);
    __server = __app.listen(DAEMON_PORT, () => {
        console.log(`Listening on ${DAEMON_PORT}`);
    });
}

export async function stopDaemon() {
    console.log("Stopping daemon");
    __server.close();
}
