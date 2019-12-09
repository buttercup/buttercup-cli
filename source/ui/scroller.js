const logUpdate = require("log-update");
const boxen = require("boxen");
const cliSize = require("cli-size");
const cliResize = require("cli-resize");
const chalk = require("chalk");
const { onKey } = require("../library/key.js");

const PADDING_HORIZONTAL = 1;

function normaliseSize(size) {
    return typeof size.columns === "number"
        ? {
            width: size.columns,
            height: size.rows
        } : size;
}

function padLine(line, length, char = " ") {
    if (line.length >= length) {
        return line;
    }
    let output = line;
    while (output.length < length) {
        output += char;
    }
    return output;
}

function showScroller({ lines, visibleLines: uVisibleLines = 5 }) {
    if (lines.length <= 0) {
        throw new Error("Cannot show empty scroller");
    }
    const visibleLines = Math.min(uVisibleLines, lines.length);
    let scrollPosition = 0,
        selectedLineInView = 0,
        active = true,
        currentTerminalSize = normaliseSize(cliSize());
    const render = () => {
        const maxLineLength = currentTerminalSize.width - 2 - (PADDING_HORIZONTAL * 2);
        const innerText = lines
            .slice(scrollPosition, scrollPosition + visibleLines)
            .map((line, idx) => {
                const newLine = padLine(line.slice(0, maxLineLength), maxLineLength);
                return idx === selectedLineInView ? chalk.inverse(newLine) : newLine;
            })
            .join("\n");
        logUpdate(boxen(innerText, {
            padding: {
                top: 0,
                bottom: 0,
                left: PADDING_HORIZONTAL,
                right: PADDING_HORIZONTAL
            }
        }));
    };
    const removeKeyListener = onKey(key => {
        if (key.name === "up") {
            if (selectedLineInView === 0) {
                scrollPosition = Math.max(0, scrollPosition - 1);
            } else {
                selectedLineInView -= 1;
            }
        } else if (key.name === "down") {
            if (selectedLineInView === visibleLines - 1) {
                scrollPosition = Math.min(lines.length - visibleLines, scrollPosition + 1);
            } else {
                selectedLineInView += 1;
            }
        }
        render();
    });
    const stop = () => {
        active = false;
        removeKeyListener();
    };
    cliResize(size => {
        if (active) {
            currentTerminalSize = normaliseSize(size);
            render();
        }
    });
    render();
    return stop;
}

module.exports = {
    showScroller
};
