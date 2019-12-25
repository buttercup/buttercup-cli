const logUpdate = require("log-update");
const boxen = require("boxen");
const cliSize = require("cli-size");
const cliResize = require("cli-resize");
const chalk = require("chalk");
const stripANSI = require("strip-ansi");
const { onKey } = require("../library/key.js");

const NOOP = () => {}

function actualLength(str) {
    return stripANSI(str).length;
}

function normaliseSize(size) {
    return typeof size.columns === "number"
        ? {
            width: size.columns,
            height: size.rows
        } : size;
}

function padLine(line, length, char = " ") {
    if (actualLength(line) >= length) {
        return line;
    }
    let output = line;
    while (actualLength(output) < length) {
        output += char;
    }
    return output;
}

function showScroller({ lines: linesRaw, onKey: onKeyCB = NOOP, visibleLines = 5 }) {
    let lines = linesRaw;
    if (actualLength(lines) <= 0) {
        throw new Error("Cannot show empty scroller");
    }
    let scrollPosition = 0,
        selectedLineInView = 0,
        active = true,
        currentTerminalSize = normaliseSize(cliSize());
    const render = () => {
        const maxLineLength = currentTerminalSize.width - 2 - 2; // - (border) - (padding)
        const rawOutputLines = lines
            .slice(scrollPosition, scrollPosition + visibleLines)
            .map((line, idx) => {
                const newLine = padLine(
                    ` ${line.slice(0, maxLineLength)} `,
                    maxLineLength
                );
                return idx === selectedLineInView ? chalk.inverse(newLine) : newLine;
            });
        while (rawOutputLines.length < visibleLines) {
            rawOutputLines.push("");
        }
        const innerText = rawOutputLines.join("\n");
        logUpdate(boxen(innerText, { padding: 0 }));
    };
    const update = (newLines = lines) => {
        lines = newLines;
        if (lines.length <= 0) {
            throw new Error("Cannot update empty scroller");
        }
        render();
    };
    const removeKeyListener = onKey(key => {
        if (key.name === "up") {
            if (selectedLineInView === 0) {
                scrollPosition = Math.max(0, scrollPosition - 1);
            } else {
                selectedLineInView -= 1;
            }
            return render();
        } else if (key.name === "down") {
            const actualVisibleLines = Math.min(visibleLines, lines.length);
            if (selectedLineInView === actualVisibleLines - 1) {
                scrollPosition = Math.min(lines.length - actualVisibleLines, scrollPosition + 1);
            } else {
                selectedLineInView += 1;
            }
            return render();
        }
        onKeyCB(key, scrollPosition + selectedLineInView);
    });
    const stop = ({ clear = true } = {}) => {
        active = false;
        removeKeyListener();
        if (clear) {
            logUpdate.clear();
        }
    };
    cliResize(size => {
        if (active) {
            currentTerminalSize = normaliseSize(size);
            render();
        }
    });
    render();
    return {
        stop,
        update
    };
}

module.exports = {
    showScroller
};
