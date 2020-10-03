import fs from "fs";
import { StorageInterface } from "buttercup";
import pify from "pify";

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

export class FileStorageInterface extends StorageInterface {
    path: string;

    constructor(filename: string) {
        super();
        this.path = filename;
    }

    async getAllKeys(): Promise<Array<string>> {
        const content = await this._getContent();
        return content ? Object.keys(content) : [];
    }

    async getValue(name: string): Promise<string | null> {
        const content = await this._getContent();
        return typeof content[name] !== "undefined" ? content[name] : null;
    }

    async removeKey(name: string): Promise<void> {
        const content = await this._getContent();
        delete content[name];
        await writeFile(this.path, JSON.stringify(content));
    }

    async setValue(name: string, value: string): Promise<void> {
        const content = await this._getContent();
        content[name] = value;
        await writeFile(this.path, JSON.stringify(content));
    }

    async _getContent() {
        try {
            const raw = await readFile(this.path);
            return JSON.parse(raw);
        } catch (err) {
            return null;
        }
    }
}
