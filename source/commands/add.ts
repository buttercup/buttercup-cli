import inquirer from "inquirer";
import { launchDaemon } from "../client/launch";
import { getMasterPassword } from "../library/password";
import { ArgVAddVault, DatasourceType } from "../types";

export interface AddVaultAnswers {
    initialise?: boolean;
    path?: string;
    type: DatasourceType;
}
export interface AddVaultPayload {
    initialise?: boolean;
    masterPassword: string;
    path?: string;
    type: DatasourceType;
}

export async function add(argv: ArgVAddVault) {
    const commands = argv._ || [];
    commands.shift();
    const [initialFilePath = null] = commands;
    // Build prompt
    const prompts = [];
    if (!argv.type) {
        prompts.push({
            type: "list",
            name: "type",
            message: "Which vault type?",
            choices: [
                { name: "File", value: DatasourceType.File }
            ],
            default: 0
        });
    }
    prompts.push({
        type: "input",
        name: "path",
        message: "Absolute vault path",
        validate: (value: string) => {
            if (!/^\//.test(value)) {
                return "Paths must be absolute (begin with a /)";
            }
            return true;
        },
        when: (answers: AddVaultAnswers) =>
            answers.type === DatasourceType.File &&
            !initialFilePath
    });
    prompts.push({
        type: "confirm",
        name: "initialise",
        message: "Create new vault?",
        default: false,
        when: (answers: AddVaultAnswers) => answers.type !== DatasourceType.MyButtercup
    });
    // Prompt
    const results: AddVaultAnswers = await inquirer.prompt(prompts);
    // Get Password
    const masterPassword = await getMasterPassword();
    // Create payload
    const payload: AddVaultPayload = {
        initialise: results.initialise,
        masterPassword,
        path: initialFilePath || results.path || null,
        type: results.type
    };
    await addVault(payload);
}

async function addVault(payload: AddVaultPayload) {
    // Launch daemon
    await launchDaemon();
}
