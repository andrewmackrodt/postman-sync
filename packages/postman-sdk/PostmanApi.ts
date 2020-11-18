import { Client } from './Client'
import { Collections } from './Collections'
import { Environments } from './Environments'
import { Workspaces } from './Workspaces'

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
