import PrettyError from "pretty-error";

let __pe;

function getPrettyError() {
    return (__pe = __pe || new PrettyError());
}

export function logError(error: Error) {
    console.log(getPrettyError().render(error));
}
