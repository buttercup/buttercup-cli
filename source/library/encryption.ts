import crypto from "crypto";
import { EncryptionType, createSession } from "iocane";
import randomString from "crypto-random-string";
import { RSAKeyPair } from "../types";

const CRYPTO_SEP = "||";

// Encryption based off this article: https://www.sohamkamani.com/nodejs/rsa-encryption/

export async function decryptContent(content: string, keyPair: RSAKeyPair): Promise<string> {
    const [encryptedKey, encryptedPayload] = content.split(CRYPTO_SEP);
    // Decrypt key
    const secret = await decryptContentRSA(encryptedKey, keyPair);
    // Decrypt payload
    const decryptedContent = await createSession().decrypt(encryptedPayload, secret);
    return decryptedContent as string;
}

export async function encryptContent(content: string, keyPair: RSAKeyPair): Promise<string> {
    const secret = generateSecret();
    // First encrypt the secret using the RSA keypair
    const encryptedKey = await encryptContentRSA(secret, keyPair);
    // Encrypt the payload using the secret
    const encryptedPayload = await createSession().use(EncryptionType.CBC).encrypt(content, secret);
    return `${encryptedKey}${CRYPTO_SEP}${encryptedPayload}`;
}

async function decryptContentRSA(content: string, keyPair: RSAKeyPair): Promise<string> {
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

async function encryptContentRSA(content: string, keyPair: RSAKeyPair): Promise<string> {
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

function generateSecret(): string {
    return randomString({ length: 32 });
}
