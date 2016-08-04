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
                    type: "password",
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
    },

    deleteGroup: function(group) {
        return menu
            .presentConfirmOption("Confirm delete")
            .then(function(shouldDelete) {
                if (shouldDelete) {
                    let title = group.getTitle();
                    group.delete();
                    console.log(`Deleted group '${title}'`);
                }
                return shouldDelete;
            });
    }

};
