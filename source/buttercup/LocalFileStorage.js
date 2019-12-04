const fs = require("fs");
const { storage: { StorageInterface } } = require("buttercup");
const ChannelQueue = require("@buttercup/channel-queue");
const pify = require("pify");

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

class LocalFileStorage extends StorageInterface {
    constructor(filePath) {
        super();
        this._filePath = filePath;
        this.queue = new ChannelQueue();
    }

    async getAllKeys() {
        const storage = await this._readStorage();
        return Object.keys(storage);
    }

    async getValue(key) {
        const storage = await this._readStorage();
        return storage.hasOwnProperty(key) ? storage[key] : null;
    }

    async removeKey(key) {
        const storage = await this._readStorage();
        delete storage[key];
        await this._writeStorage(storage);
    }

    _readStorage() {
        return this.queue.channel("storage").enqueue(async () => {
            try {
                const fileContents = await readFile(this._filePath, "utf8");
                return JSON.parse(fileContents);
            } catch (err) {
                return {};
            }
        });
    }

    _writeStorage(data) {
        return this.queue.channel("storage").enqueue(() => {
            return writeFile(this._filePath, JSON.stringify(data, undefined, 2));
        });
    }
}

module.exports = LocalFileStorage;
