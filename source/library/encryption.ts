import crypto from "crypto";
import { RSAKeyPair } from "../types";

// Encryption based off this article: https://www.sohamkamani.com/nodejs/rsa-encryption/

export async function decryptContent(content: string, keyPair: RSAKeyPair): Promise<string> {
    const decryptedData = crypto.privateDecrypt(
        {
            key: keyPair.private,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha512",
        },
        Buffer.from(content, "base64")
    );
    return decryptedData.toString("utf8");
}

export async function encryptContent(content: string, keyPair: RSAKeyPair): Promise<string> {
    const encryptedData = crypto.publicEncrypt(
        {
            key: keyPair.public,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha512",
        },
        Buffer.from(content)
    );
    return encryptedData.toString("base64");
}
