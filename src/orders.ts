import type { HttpClient } from './client.js'
import type { CreateOrderParams, Order, OrderWithFills } from './types.js'

export class OrdersModule {
  constructor(private readonly http: HttpClient) {}

  async create(params: CreateOrderParams): Promise<Order> {
    const { idempotency_key, ...body } = params
    if (!body.order_type) body.order_type = 'MARKET'
    const headers: Record<string, string> = {}
    if (idempotency_key) headers['Idempotency-Key'] = idempotency_key
    return this.http.post<Order>('/api/v1/orders', body, headers)
  }

  async list(limit = 30, offset = 0, status?: string): Promise<{ orders: Order[]; total: number }> {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (status) qs.set('status', status)
    return this.http.get<{ orders: Order[]; total: number }>(`/api/v1/orders?${qs}`)
  }

  async get(id: string): Promise<OrderWithFills> {
    return this.http.get<OrderWithFills>(`/api/v1/orders/${id}`)
  }
}
