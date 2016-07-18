const passwordPrompt = require("pw");
const selectPrompt = require("select-prompt");
const textPrompt = require("text-prompt");

module.exports = {

    presentPasswordPrompt: function(text = "Password:") {
        process.stdout.write(text);
        return new Promise(function(resolve) {
            passwordPrompt(function(password) {
                resolve(password);
            });
        });
    },

    presentPrompt: function(text) {
        return new Promise(function(resolve, reject) {
            textPrompt(text)
                .on("submit", (v) => resolve(v))
                .on("abort", () => reject());
        });
    },

    presentSelectMenu: function(title, menuItems) {
        return new Promise(function(resolve, reject) {
            selectPrompt(title, menuItems, { cursor: 0 })
                .on("abort", (e) => reject(e))
                .on("submit", (v) => resolve(v));
        });
    }

};
