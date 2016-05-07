"use strict";

const Blessed = require("blessed");

const Component = require("./Component.js");

module.exports = class MenuBar extends Component {

    constructor() {
        super();
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

        // menu.key('1', (ch, key) => {
        //     menu.select(0);
        //     process.exit(0);
        // });

        super.init();
    }

    toggleButtercupMenu() {
        if (this.buttercupMenu) {
            this.buttercupMenu.destroy();
            this.buttercupMenu = null;
            this.render();
        } else {
            let items = [
                    "Create new archive",
                    "Open local archive",
                    "Quit"
                ],
                menu = this.buttercupMenu = Blessed.list({
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

            global.screen.append(menu);
            this.render();
            menu.focus();
        }
    }

}
