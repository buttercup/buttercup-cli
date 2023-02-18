import inquirer from "inquirer";
import { getMasterPassword } from "../library/password";
import { addVault as requestAddVault, getCurrentVaults } from "../client/adapter";
import { AddVaultPayload, ArgVAdd, DatasourceType } from "../types";

export interface AddVaultAnswers {
    initialise?: boolean;
    name?: string;
    path?: string;
    type: DatasourceType;
}

const DEFAULT_VAULT_TYPE = DatasourceType.File;
const VAULT_NAME_REXP = /^[a-z0-9_]+$/;

export async function add(argv: ArgVAdd) {
    const [type] = argv._;
    switch (type) {
        case "vault":
            /* falls-through */
        case "vaults":
            return addVault(argv);
        default:
            throw new Error(`Invalid add type: ${type}`);
    }
}

async function addVault(argv: ArgVAdd) {
    const commands = argv._ || [];
    const [, initialFilePath = null] = commands;
    if (argv.name && !VAULT_NAME_REXP.test(argv.name)) {
        throw new Error(`Invalid vault name: ${argv.name} (should match: ${VAULT_NAME_REXP.toString()})`);
    }
    const currentSources = await getCurrentVaults();
    // Build prompt
    const prompts = [];
    prompts.push({
        type: "list",
        name: "type",
        message: "Which vault type?",
        choices: [
            { name: "File", value: DatasourceType.File }
        ],
        default: DEFAULT_VAULT_TYPE,
        when: () => !argv.type
    });
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
            !initialFilePath,
        filter: (value: string) => /\.bcup$/i.test(value) ? value : `${value}.bcup`
    });
    prompts.push({
        type: "input",
        name: "name",
        message: "Vault name ([a-z0-9_])",
        validate: (value: string) => {
            if (!VAULT_NAME_REXP.test(value)) {
                return "Invalid vault name";
            } else if (currentSources.find(source => source.name === value)) {
                return "Vault name already in use";
            }
            return true;
        },
        when: () => !argv.name
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
        name: argv.name || results.name,
        path: initialFilePath || results.path || null,
        type: results.type || DEFAULT_VAULT_TYPE
    };
    await requestAddVault(payload);
}


