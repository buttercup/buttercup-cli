"use strict";

const screen = global.screen;

module.exports = class Component {

    constructor() {
        this.element = null;
        this.screen = screen;
        this.application = null;

        this._hasInitialised = false;
        this._appendCBs = [];
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
        scr = scr || this.screen;
        scr.append(this.element);
        this._appendCBs.forEach((cb) => {
            (cb)();
        });
        this.render();
    }

    destroy() {
        if (this.element) {
            this.element.destroy();
        }
        this.render();
    }

    focus() {
        this.element.focus();
    }

    init() {
        this._hasInitialised = true;
    }

    render() {
        this.screen.render();
    }

    setApplication(app) {
        this.application = app;
    }

    waitForAppend() {
        return new Promise((resolve) => {
            this._appendCBs.push(resolve);
        });
    }

}
