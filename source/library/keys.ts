import fs from "fs";
import path from "path";
import crypto from "crypto";
import randomString from "crypto-random-string";
import userHome from "user-home";
import pify from "pify";
import createMode from "stat-mode";
import { RSAKeyPair } from "../types";

const mkdir = pify(fs.mkdir);
const readFile = pify(fs.readFile);
const stat = pify(fs.stat);
const writeFile = pify(fs.writeFile);

export function generateKeyPair(): Promise<RSAKeyPair> {
    return new Promise((resolve, reject) => {
        const secret = generateKeyPairSecret();
        crypto.generateKeyPair(
            "rsa",
            {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem"
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem"
                }
            },
            (err: Error, pubKey: string, privKey: string) => {
                if (err) return reject(err);
                resolve({
                    public: pubKey,
                    private: privKey
                });
            }
        );
    });
}

function generateKeyPairSecret(): string {
    return randomString({ length: 36 });
}

export async function getKeys(): Promise<RSAKeyPair> {
    const keyPath = path.join(userHome, ".buttercup/cli");
    await mkdir(keyPath, { recursive: true });
    const raw = await readFile(path.join(keyPath, "daemon.bcupkp"), "utf8");
    const payload = JSON.parse(raw) as {
        keys: RSAKeyPair,
        ts: string
    };
    return payload.keys;
}

export async function storeKeys(keyPair: RSAKeyPair) {
    const keyPath = path.join(userHome, ".buttercup/cli");
    await mkdir(keyPath, {
        recursive: true
    });
    const filename = path.join(keyPath, "daemon.bcupkp");
    await writeFile(filename, JSON.stringify({
        keys: keyPair,
        ts: (new Date()).toISOString()
    }));
    // Change permissions
    const fileStat = await stat(filename);
    const mode = createMode(fileStat);
    mode.owner.read = true;
    mode.owner.write = true;
    mode.owner.execute = false;
    mode.group.read = false;
    mode.group.write = false;
    mode.group.execute = false;
    mode.others.read = false;
    mode.others.write = false;
    mode.others.execute = false;
}
