"use strict";

const Blessed = require("blessed");

const Component = require("./Component.js");

module.exports = class PasswordPrompt extends Component {

    constructor() {
        super();
        this._setCB = null;
        this._setPassword = null;
    }

    getPassword() {
        return new Promise((resolve) => {
            if (this._setPassword) {
                let pass = this._setPassword;
                this._setPassword = null;
                (resolve)(pass);
            } else {
                this._setCB = resolve;
            }
        });
    }

    init() {
        let container = this.element = Blessed.box({
            top: 'center',
            left: 'center',
            width: "60%",
            height: 5,
            border: {
                type: 'line'
            },
            mouse: true,
            keys: true
        });

        this.waitForAppend()
            .then(() => {
                let textLeft = 3,
                    textWidth = 10,
                    passwordText = Blessed.text({
                        top: 1,
                        left: textLeft,
                        content: "Password:",
                        //height: 1,
                        width: textWidth
                    });
                container.append(passwordText);

                let promptLeft = textLeft + textWidth + 2,
                    passwordPrompt = Blessed.textbox({
                        top: 1,
                        left: promptLeft,
                        width: container.width - promptLeft - 3,
                        censor: true
                    });
                container.append(passwordPrompt);

                container.on("click", () => {
                    passwordPrompt.focus();
                });

                passwordPrompt.readInput(() => {
                    let psw = passwordPrompt.getValue();
                    if (this._setCB) {
                        (this._setCB)(psw);
                    } else {
                        this._setPassword = psw;
                    }
                });

                this.render();
            });

        super.init();
    }

}
