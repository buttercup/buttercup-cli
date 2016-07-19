const passwordPrompt = require("pw");
const read = require("read");
const inquirer = require("inquirer");

module.exports = {

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
