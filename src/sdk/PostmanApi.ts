import { Client } from './Client.js'
import { Collections } from './Collections.js'
import { Environments } from './Environments.js'
import { Workspaces } from './Workspaces.js'

export class PostmanApi {
    protected readonly client: Client

    public constructor(apiKey: string) {
        this.client = new Client(apiKey)
    }

    public get collections(): Collections {
        return new Collections(this.client)
    }

    public get environments(): Environments {
        return new Environments(this.client)
    }

    public get workspaces(): Workspaces {
        return new Workspaces(this.client)
    }
}
