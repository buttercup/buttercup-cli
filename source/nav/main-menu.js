const menu = require("../tools/menu.js");
const openArchive = require("./open-archive.js");

const MAIN_MENU = [
    { title: "Create new archive",              value: "create" },
    { title: "Open existing archive",           value: "open" },
    { title: "Exit",                            value: "exit" }
];

let mainMenu = module.exports = {

    openArchive: function() {
        return menu
            .presentPrompt("Filename")
            .then(openArchive.openFile);
    },

    presentMenu: function() {
        return menu
            .presentSelectMenu("Buttercup", MAIN_MENU)
            .then(function(action) {
                if (action === "exit") {
                    console.log("Bye!");
                    process.exit(0);
                } else if (action === "open") {
                    return mainMenu.openArchive();
                }
            });
    }

};
