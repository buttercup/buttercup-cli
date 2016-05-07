"use strict";

const Blessed = require("blessed");

const Component = require("./Component.js");

module.exports = class MenuBar extends Component {

    constructor() {
        super();
    }

    attachNumberKeys(el) {
        el.key(['1'], (ch, key) => {
            if (this.menuBox) {
                this.closeMenu();
            } else {
                this.element.selectTab(parseInt(ch, 10) - 1);
            }
        });
    }

    closeMenu() {
        if (this.menuBox) {
            this.menuBox.destroy();
        }
        this.menuBox = null;
        this.render();
    }

    init() {
        let menu = this.element = Blessed.listbar({
            top: '0',
            left: '0',
            width: '100%',
            height: 1,
            content: '',
            tags: true,
            mouse: true,
            keys: true,
            selectedBg: 'green',
            // border: {
            //     type: 'line'
            // },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: '#f0f0f0'
                },
                hover: {
                    bg: 'green'
                }
            }
        });

        menu.addItem("Buttercup", () => {
            this.toggleButtercupMenu();
        });

        this.attachNumberKeys(menu);

        super.init();
    }

    toggleButtercupMenu() {
        if (this.menuBox) {
            this.closeMenu();
        } else {
            let items = [
                    "Create new archive",
                    "Open local archive",
                    "Quit"
                ],
                menu = this.menuBox = Blessed.list({
                    width: 25,
                    height: items.length + 2,
                    top: 1,
                    left: 2,
                    mouse: true,
                    keys: true,
                    selectedBg: 'green',
                    border: {
                        type: 'line'
                    }
                });
            menu.setItems(items);

            menu.on("select", (item) => {
                let title = item.getText();
                switch(title) {
                    case "Quit":
                        process.exit(0);
                        break;
                    default:
                        // nothing
                        setTimeout(() => {
                            this.toggleButtercupMenu();
                        }, 50);
                        break;
                };
            });
            this.attachNumberKeys(menu);

            global.screen.append(menu);
            this.render();
            menu.focus();
        }
    }

}
