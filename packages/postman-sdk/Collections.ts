import { Client } from './Client'

export interface CollectionFolder {
    name: string
    item: CollectionItem[]
    _postman_id: string
    _postman_isSubFolder?: boolean
}

export interface CollectionRequest {
    name: string
    _postman_id: string
    protocolProfileBehavior: Record<string, any>
    request: {
        method: string
        url: any
        description?: string
        header?: {
            key: string
            value: string
            type: string
        }[]
        body?: any

    }
    response: any[]
}

export type CollectionItem = CollectionFolder | CollectionRequest

export interface Collection {
    info: {
        _postman_id: string
        name: string
        description?: string
        schema: string
    }
    item: CollectionItem[]
    auth?: {
        type: string
        [key: string]: any
    }
    event?: {
        id: string
        listen: string
        script: {
            type: string
            exec: string[]
        }
    }[]
    variable?: {
        id: string
        key: string
        value: string
        type: string
    }[]
}

export interface CollectionListItem {
    id: string
    name: string
    owner?: string
    uid: string
}

interface CreateCollectionRequest {
    info: {
        name: string
        description?: string
        schema: string
    }
    item?: CollectionItem[]
    auth?: {
        type: string
        [key: string]: any
    }
    event?: {
        listen: string
        script: {
            type: string
            exec: string[]
        }
    }[]
    variable?: {
        key: string
        value: string
        type: string
    }[]
}

export class Collections {
    protected readonly client: Client

    public constructor(client: Client) {
        this.client = client
    }

    public async create(data: CreateCollectionRequest, workspaceId?: string): Promise<Collection> {
        const response = await this.client.request<any>('post', 'collections', {
            params: workspaceId ? { workspace: workspaceId } : undefined,
            data: {
                collection: data,
            },
        })

        return this.get(response.collection.id)
    }

    public async get(collectionListItem: CollectionListItem): Promise<Collection>
    public async get(uid: string): Promise<Collection>

    public async get(collection: CollectionListItem | string): Promise<Collection> {
        const uid = typeof collection === 'object'
            ? collection.uid
            : collection

        const response = await this.client.request<any>('get', `collections/${uid}`)

        return response.collection
    }

    public async list(): Promise<CollectionListItem[]> {
        const response = await this.client.request<any>('get', 'collections')

        return response.collections
    }
}
