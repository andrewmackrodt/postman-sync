import { Client } from './Client'

export interface EnvironmentValue {
    key: string
    value: string
    type: string
    enabled: boolean
    hovered?: boolean
}

export interface Environment {
    id: string
    name: string
    values: EnvironmentValue[]
}

export interface EnvironmentListItem {
    id: string
    name: string
    owner?: string
    uid: string
}

export interface CreateEnvironmentRequest {
    name: string
    values: {
        key: string
        value: string
    }[]
}

export class Environments {
    protected readonly client: Client

    public constructor(client: Client) {
        this.client = client
    }

    public async create(data: CreateEnvironmentRequest, workspaceId?: string): Promise<Environment> {
        const response = await this.client.request<any>('post', 'environments', {
            params: workspaceId ? { workspace: workspaceId } : undefined,
            data: {
                environment: data,
            },
        })

        return this.get(response.environment.id)
    }

    public async get(environmentListItem: EnvironmentListItem): Promise<Environment>
    public async get(uid: string): Promise<Environment>

    public async get(environment: EnvironmentListItem | string): Promise<Environment> {
        const uid = typeof environment === 'object'
            ? environment.uid
            : environment

        const response = await this.client.request<any>('get', `environments/${uid}`)

        return response.environment
    }

    public async list(): Promise<EnvironmentListItem[]> {
        const response = await this.client.request<any>('get', 'environments')

        return response.environments
    }
}
