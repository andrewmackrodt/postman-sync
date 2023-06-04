import axios, { Method } from 'axios'

interface RequestOptions {
    data?: Record<string, unknown>
    params?: Record<string, string>
}

export class Client {
    public static API_ROOT = 'https://api.postman.com'
    protected readonly apiKey: string

    public constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async request<T = any>(method: Method, path: string, options?: RequestOptions): Promise<T> {
        const response = await axios.request({
            baseURL: Client.API_ROOT,
            url: path,
            params: options?.params,
            method,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-Api-Key': this.apiKey,
            },
            data: options?.data,
        })

        return response.data
    }
}
