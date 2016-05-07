"use strict";

const screen = global.screen;

module.exports = class Component {

    constructor() {
        this.element = null;

        this._hasInitialised = false;
    }

    appendToElement(node) {
        if (!this._hasInitialised) {
            this.init();
        }
        node.append(this.element);
        this.render();
    }

    appendToScreen(scr) {
        if (!this._hasInitialised) {
            this.init();
        }
        scr.append(this.element);
        screen.render();
    }

    init() {
        this._hasInitialised = true;
    }

    render() {
        screen.render();
    }

}
