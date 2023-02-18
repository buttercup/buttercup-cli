import { getKeys } from "../library/keys";
import { decryptContent } from "../library/encryption";
import { DaemonRequest } from "../types";

export async function handleAuth(req, res, next) {
    const encryptedContent = req.body as string;
    const keys = await getKeys();
    let rawPayload;
    try {
        rawPayload = await decryptContent(encryptedContent, keys);
    } catch (err) {
        res.status(401).send("Unauthorized");
        return;
    }
    try {
        req.body = JSON.parse(rawPayload) as DaemonRequest;
    } catch (err) {
        res.status(400).send("Bad request");
        return;
    }
    next();
}
