const stripANSI = require("strip-ansi");

function actualLength(str) {
    return stripANSI(str).length;
}

function padLine(line, length, char = " ", right = true) {
    if (actualLength(line) >= length) {
        return line;
    }
    let output = `${line}`;
    while (actualLength(output) < length) {
        if (right) {
            output += char;
        } else {
            output = `${char}${output}`;
        }
    }
    return output;
}

module.exports = {
    actualLength,
    padLine
};
