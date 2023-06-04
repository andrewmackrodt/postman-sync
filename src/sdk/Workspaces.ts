import { Client } from './Client.js'
import { CollectionListItem } from './Collections.js'
import { EnvironmentListItem } from './Environments.js'

export interface Workspace {
    id: string
    name: string
    type: string
    description: string
    collections?: CollectionListItem[]
    environments?: EnvironmentListItem[]
}

export interface WorkspaceListItem {
    id: string
    name: string
    type: string
}

export interface CreateWorkspaceRequest {
    name: string
    type: string
    description?: string
}

export class Workspaces {
    protected readonly client: Client

    public constructor(client: Client) {
        this.client = client
    }

    public async create(data: CreateWorkspaceRequest): Promise<Workspace> {
        const response = await this.client.request('post', 'workspaces', {
            data: {
                workspace: data,
            },
        })

        return this.get(response.workspace.id)
    }

    public async get(workspaceListItem: WorkspaceListItem): Promise<Workspace>
    public async get(uid: string): Promise<Workspace>

    public async get(workspace: WorkspaceListItem | string): Promise<Workspace> {
        const uid = typeof workspace === 'object'
            ? workspace.id
            : workspace

        const response = await this.client.request('get', `workspaces/${uid}`)

        return response.workspace
    }

    public async list(): Promise<WorkspaceListItem[]> {
        const response = await this.client.request('get', 'workspaces')

        return response.workspaces
    }
}
