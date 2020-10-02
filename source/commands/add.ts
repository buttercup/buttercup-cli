import { ArgV } from "../types";

export async function add(argv: ArgV) {
    const commands = argv._ || [];
    commands.shift();
    
}
