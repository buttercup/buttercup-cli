import pw from "pw";
import chalk from "chalk";

const NO_SEP = "";

export async function getMasterPassword(): Promise<string> {
    process.stdout.write(chalk.yellow("Password: "));
    const pass: string = await new Promise(resolve => {
        pw(NO_SEP, (enteredPass: string) => {
            resolve(enteredPass);
        });
    });
    if (!pass) {
        console.log("Password cannot be empty: Please try again");
        return getMasterPassword();
    }
    return pass;
}
