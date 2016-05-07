"use strict";

const Blessed = require("blessed");

const Component = require("./Component.js");

module.exports = class OpenFileDialog extends Component {

    constructor() {
        super();
    }

    init() {
        let fileDialog = this.element = Blessed.filemanager({
            left: 'center',
            top: 'center',
            width: "75%",
            height: "60%",
            cwd: ".",
            mouse: true,
            keys: true,
            selectedBg: 'green',
            border: {
                type: 'line'
            },
        });

        fileDialog.on("file", (filePath) => {
            this.application.openArchiveFile(filePath);
        });

        super.init();
    }

}
