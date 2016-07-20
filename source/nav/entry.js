const tuck = require("tuck");
const copyPaste = require("copy-paste");
const menu = require("../tools/menu.js");

const ENTRY_BACK =          { title: "Back", value: "+back" };
const ENTRY_COPY_PASS =     { title: "Copy password", value: "+copypass" };

let entryHandler = module.exports = {

    handleEntry: function(entry) {
        let items = [
            ENTRY_BACK,
            ENTRY_COPY_PASS
        ];
        return menu
            .presentSelectMenu("Entry action", items)
            .then((action) => entryHandler.handleMenuAction(entry, action));
    },

    handleMenuAction: function(entry, action) {
        if (action === "+back") {
            return;
        } else if (action === "+copypass") {
            return Promise
                .resolve(entry.getProperty("password"))
                .then(function(password) {
                    return new Promise(function(resolve) {
                        copyPaste.copy(password, resolve);
                    });
                })
                .then(function() {
                    console.log("Password copied to clipboard.");
                    return new Promise(function(resolve) {
                        setTimeout(resolve, 1500);
                    });
                });
        }
    },

    renderEntry: function(entry) {
        console.log(tuck(
            [
                entry.getProperty("title"),
                "───",
                `Username:   ${entry.getProperty("username")}`,
                "Password:   ********"
            ], {
                center: false,
                textCenter: false
            }
        ));
    }

};
