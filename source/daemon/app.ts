import express from "express";
import { DAEMON_PORT } from "../symbols";

let __app,
    __server;

export async function startDaemon() {
    __app = express();
    __app.get("/", (req, res) => {
        res.status(200).send(JSON.stringify({
            ok: true,
            type: "bcup-cli-daemon",
            ttl: process.env.TTL
        }));
    });
    __server = __app.listen(DAEMON_PORT, () => {
        console.log(`Listening on ${DAEMON_PORT}`);
    });
}

export async function stopDaemon() {
    console.log("Stopping daemon");
    __server.close();
}
