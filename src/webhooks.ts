import type { HttpClient } from './client.js'
import type { Webhook, WebhookParams } from './types.js'

export class WebhooksModule {
  constructor(private readonly http: HttpClient) {}

  async create(params: WebhookParams): Promise<Webhook> {
    return this.http.post<Webhook>('/api/v1/webhooks', params)
  }

  async list(): Promise<Webhook[]> {
    return this.http.get<Webhook[]>('/api/v1/webhooks')
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`/api/v1/webhooks/${id}`)
  }
}
