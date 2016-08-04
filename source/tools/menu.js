const passwordPrompt = require("pw");
const read = require("read");
const inquirer = require("inquirer");

const CONFIRM_NO =    { title: "No", value: false };
const CONFIRM_YES =   { title: "Yes", value: true };

let menu = module.exports = {

    presentConfirmOption: function(title) {
        return menu.presentSelectMenu(title || "Confirm", [
            CONFIRM_YES,
            CONFIRM_NO
        ]);
    },

    presentPasswordPrompt: function(text = "Password") {
        process.stdout.write(`${text}: `);
        return new Promise(function(resolve) {
            passwordPrompt(function(password) {
                setTimeout(function() {
                    resolve(password);
                }, 0);
            });
        });
    },

    presentPrompt: function(text) {
        return new Promise(function(resolve, reject) {
            read({ prompt: `${text}: ` }, function(err, val) {
                if (err) {
                    reject(err);
                } else {
                    resolve(val);
                }
            });
        });
    },

    presentPrompts: function(items, results) {
        results = results || {};
        let nextItem = items.shift();
        if (nextItem) {
            let itemTest = nextItem.test || /.+/,
                promptMethod = menu.presentPrompt;
            if (nextItem.type === "password") {
                promptMethod = menu.presentPasswordPrompt;
            }
            return promptMethod(nextItem.title)
                .then(function(result) {
                    if (itemTest.test(result)) {
                        results[nextItem.key] = result;
                    } else {
                        console.warn(`Invalid value for ${nextItem.title}, please try again:`);
                        items.unshift(nextItem);
                    }
                    return menu.presentPrompts(items, results);
                });
        }
        return Promise.resolve(results);
    },

    presentSelectMenu: function(title, menuItems) {
        return inquirer
            .prompt([
                {
                    type: "list",
                    name: "prompt",
                    message: title,
                    choices: menuItems.map((item) => item.title),
                    filter: function(title) {
                        for (let i = 0, itemsLen = menuItems.length; i < itemsLen; i += 1) {
                            if (menuItems[i].title === title) {
                                return menuItems[i].value;
                            }
                        }
                        return null;
                    }
                }
            ])
            .then(function(answers) {
                return answers.prompt;
            });
    }

};
