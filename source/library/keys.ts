import fs from "fs";
import path from "path";
import crypto from "crypto";
import randomString from "crypto-random-string";
import userHome from "user-home";
import pify from "pify";
import { RSAKeyPair } from "../types";

const mkdir = pify(fs.mkdir);
const readFile = pify(fs.readFile);
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
                    format: "pem",
                    cipher: "aes-256-cbc",
                    passphrase: secret
                }
            },
            (err: Error, pubKey: string, privKey: string) => {
                if (err) return reject(err);
                resolve({
                    public: pubKey,
                    private: privKey,
                    secret
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
    await writeFile(path.join(keyPath, "daemon.bcupkp"), JSON.stringify({
        keys: keyPair,
        ts: (new Date()).toISOString()
    }));
}
