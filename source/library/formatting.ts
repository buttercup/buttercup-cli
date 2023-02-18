export function generateIndentation(spaces): string {
    let output = "";
    for (let i = 0; i < spaces; i += 1) {
        output += " ";
    }
    return output;
}
