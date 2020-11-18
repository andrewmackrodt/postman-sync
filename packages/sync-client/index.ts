import { Collection } from '@postman-sync/postman-sdk/Collections'
import { Environment } from '@postman-sync/postman-sdk/Environments'
import { PostmanApi } from '@postman-sync/postman-sdk/PostmanApi'
import { Workspace } from '@postman-sync/postman-sdk/Workspaces'
import { argv } from 'yargs'
import { glob } from 'glob'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

function getUsage() {
    return `
usage: postman-sync [options] <command> [parameters]

options:
  -k | --api-key=       postman api key [or env.POSTMAN_API_KEY]
  -h | --help           prints this help text

commands:
  export
    -o | --output=      output directory (default: current directory)
    -w | --workspace=   workspace id to export
  import
    -i | --input=       input directory (default: current directory)

`.trim()
}

function assetNoSubCommands(command: string, subCommands: string[]) {
    if (subCommands.length !== 0) {
        throw new Error(`${command} does not accept any sub commands`)
    }
}

function getOptionAsString(name: string, alias?: string) {
    let value = argv[name]

    if (typeof value === 'undefined' && alias) {
        value = argv[alias]
    }

    if (typeof value === 'string') {
        return value
    }
}

function getOptionAsStringOrFail(name: string, alias?: string) {
    const value = getOptionAsString(name, alias)

    if (typeof value === 'undefined') {
        throw new Error(`--${name} is required`)
    }

    return value
}

function getApiKey() {
    const apiKey = argv['k'] ?? argv['api-key'] ?? process.env.POSTMAN_API_KEY

    if (typeof apiKey !== 'string') {
        throw new Error('--api-key is required')
    }

    if ( ! apiKey.match(/^PMAK-[a-z0-9-]+$/)) {
        throw new Error('--api-key is invalid')
    }

    return apiKey
}

async function exportCommand() {
    const workspaceId = getOptionAsStringOrFail('workspace', 'w')
    const output = getOptionAsString('output', 'o') ?? process.cwd()
    await fs.promises.mkdir(output, { recursive: true })

    const api = new PostmanApi(getApiKey())

    const workspace = await api.workspaces.get(workspaceId)
    const filename = `${workspace.name}.postman_workspace.json`
    const filepath = path.join(output, filename)
    await fs.promises.writeFile(filepath, JSON.stringify(workspace, null, 4))

    for (const colListItem of workspace?.collections || []) {
        const collection = await api.collections.get(colListItem)
        const filename = `${collection.info.name}.postman_collection.json`
        const filepath = path.join(output, filename)
        await fs.promises.writeFile(filepath, JSON.stringify(collection, null, 4))
    }

    for (const envListItem of workspace?.environments || []) {
        const environment = await api.environments.get(envListItem)
        const filename = `${environment.name}.postman_environment.json`
        const filepath = path.join(output, filename)
        await fs.promises.writeFile(filepath, JSON.stringify(environment, null, 4))
    }
}

async function importCommand() {
    const input = getOptionAsString('input', 'i') ?? process.cwd()
    const pattern = path.join(input, '*.json')
    const files = await promisify(glob)(pattern)

    const workspaces = files.filter(x => x.match(/\.postman_workspace\.json$/))

    if (workspaces.length !== 1) {
        throw new Error('input directory must contain exactly one workspace export')
    }

    const api = new PostmanApi(getApiKey())

    const data: Workspace = await fs.promises.readFile(workspaces[0], 'utf8').then(x => JSON.parse(x))

    const workspace = await api.workspaces.create({
        name: data.name,
        type: 'personal',
        description: data.description,
    })

    for (const filepath of files.filter(x => x.match(/\.postman_collection\.json$/))) {
        const data: Collection = await fs.promises.readFile(filepath, 'utf8').then(x => JSON.parse(x))

        await api.collections.create(data, workspace.id)
    }

    for (const filepath of files.filter(x => x.match(/\.postman_environment\.json$/))) {
        const data: Environment = await fs.promises.readFile(filepath, 'utf8').then(x => JSON.parse(x))

        await api.environments.create(data, workspace.id)
    }
}

async function execCommand() {
    const subCommands = argv._.slice()
    const command = subCommands.shift()

    switch (command) {
        case 'export':
            assetNoSubCommands(command, subCommands)
            await exportCommand()
            break
        case 'import':
            assetNoSubCommands(command, subCommands)
            await importCommand()
            break
        default:
            console.log(getUsage())
            process.exit()
    }
}

if (argv['h'] || argv['help']) {
    console.log(getUsage())
    process.exit()
}

void execCommand().catch(err => {
    console.error('ERR ' + err.message)
    process.exit(1)
})
