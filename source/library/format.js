const stripANSI = require("strip-ansi");

function actualLength(str) {
    return stripANSI(str).length;
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

module.exports = {
    actualLength,
    padLine
};
