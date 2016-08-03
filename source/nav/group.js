const menu = require("../tools/menu.js");
const entryHandler = require("./entry.js");

module.exports = {

    createEntry: function(group) {
        return menu
            .presentPrompts([
                {
                    key: "title",
                    title: "Title",
                    test: /.+/
                },
                {
                    key: "username",
                    title: "Username",
                    test: /.+/
                },
                {
                    key: "password",
                    title: "Password",
                    test: /.*/
                }
            ])
            .then(function(results) {
                let entry = group.createEntry(results.title);
                entry
                    .setProperty("username", results.username)
                    .setProperty("password", results.password);
                return entryHandler.renderEntry(entry);
            });
    },

    createGroup: function(node) {
        return menu
            .presentPrompt("Title")
            .then(function(title) {
                return node.createGroup(title);
            });
    }

};
