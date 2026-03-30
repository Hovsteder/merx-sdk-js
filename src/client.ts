import type { ApiResponse, MerxClientOptions } from './types.js'

const DEFAULT_BASE_URL = 'https://merx.exchange'

export class HttpClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(options: MerxClientOptions) {
    this.apiKey  = options.apiKey
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'x-api-key': this.apiKey },
    })
    return this.handle<T>(res)
  }

  async post<T>(path: string, payload: unknown, headers?: Record<string, string>): Promise<T> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...headers,
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(payload),
    })
    return this.handle<T>(res)
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: { 'x-api-key': this.apiKey },
    })
    return this.handle<T>(res)
  }

  private async handle<T>(res: Response): Promise<T> {
    const body: ApiResponse<T> = await res.json()
    if (!res.ok || body.error) {
      throw new MerxError(
        body.error?.code ?? 'UNKNOWN',
        body.error?.message ?? 'Request failed',
      )
    }
    return body.data as T
  }
}

export class MerxError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message)
    this.name = 'MerxError'
  }
}
