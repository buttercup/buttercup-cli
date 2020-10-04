import PrettyError from "pretty-error";
import chalk from "chalk";

let __pe;

function getPrettyError() {
    return (__pe = __pe || new PrettyError());
}

export function logError(error: Error, full: boolean) {
    if (full) {
        console.log(getPrettyError().render(error));
    } else {
        console.log(`${chalk.bgRed.white.bold(" Error ")}: ${error.message}`);
    }
}
