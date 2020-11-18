import { Client } from './Client'
import { CollectionListItem } from './Collections'
import { EnvironmentListItem } from './Environments'

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
        const response = await this.client.request<any>('post', 'workspaces', {
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

        const response = await this.client.request<any>('get', `workspaces/${uid}`)

        return response.workspace
    }

    public async list(): Promise<WorkspaceListItem[]> {
        const response = await this.client.request<any>('get', 'workspaces')

        return response.workspaces
    }
}
