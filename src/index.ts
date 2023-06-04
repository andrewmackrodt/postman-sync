import { Collection } from './sdk/Collections.js'
import { Environment } from './sdk/Environments.js'
import { PostmanApi } from './sdk/PostmanApi.js'
import { Workspace } from './sdk/Workspaces.js'
import { Command } from 'commander'
import { promise as glob } from 'glob-promise'
import fs from 'node:fs'
import path from 'node:path'
import process from 'process'

const program = new Command()
    .name('postman-sync')
    .description('import and export workspaces across postman accounts')
    .version('0.0.0')

function commandErrorHandler(program: Command, e: unknown) {
    if (typeof e === 'object' && e !== null
        && 'signal' in e
        && e.signal === 'SIGINT'
    ) {
        process.exit(1)
    }

    program.error(e?.toString() ?? 'Unknown error')
}

interface ImportOptions {
    apiKey?: string
}

program
    .command('import')
    .description('')
    .argument('[input]', 'input directory (default: current directory)')
    .option('-k, --api-key <string>', 'postman api key')
    .action(async (input: string, options: ImportOptions) => {
        try {
            if ( ! input) {
                input = process.cwd()
            }

            const apiKey = options.apiKey || process.env.POSTMAN_API_KEY

            if ( ! apiKey) {
                return program.error('error: --api-key or env.POSTMAN_API_KEY must be set')
            }

            const pattern = path.join(input, '*.json')
            const files = await glob(pattern)
            const workspaces = files.filter(x => x.match(/\.postman_workspace\.json$/))

            if (workspaces.length !== 1) {
                return program.error('error: input directory must contain exactly one workspace export')
            }

            const api = new PostmanApi(apiKey)
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
        } catch (e) {
            commandErrorHandler(program, e)
        }
    })

interface ExportOptions {
    apiKey?: string
    output?: string
}

program
    .command('export')
    .description('')
    .argument('workspace', 'workspace id')
    .option('-k, --api-key <string>', 'postman api key')
    .option('-o, --output <string>', 'output directory (default: current directory)')
    .action(async (workspaceId: string, options: ExportOptions) => {
        try {
            const apiKey = options.apiKey || process.env.POSTMAN_API_KEY

            if ( ! apiKey) {
                return program.error('error: --api-key or env.POSTMAN_API_KEY must be set')
            }

            const output = options.output || process.cwd()
            await fs.promises.mkdir(output, { recursive: true })

            const api = new PostmanApi(apiKey)
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
        } catch (e) {
            commandErrorHandler(program, e)
        }
    })

program.parse()
